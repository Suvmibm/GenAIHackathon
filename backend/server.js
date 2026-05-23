require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const knex = require('knex');
const knexConfig = require('./knexfile');

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// 1. Choose database configuration
console.log(`[Server Startup] Node Environment: "${NODE_ENV}"`);
const dbConfig = NODE_ENV === 'production' ? knexConfig.production : knexConfig.development;
console.log(`[Server Startup] Database Client configured: "${dbConfig.client}"`);

const db = knex(dbConfig);

// 2. Middlewares
app.use(cors({
  origin: '*', // Allow all origins for the hackathon local testing convenience
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(morgan('dev'));

// 3. Attach Routes
const apiRoutes = require('./routes')(db);
app.use('/api', apiRoutes);

// 4. Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Global Error]', err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// 5. Database Self-Provisioning (Migration & Seeding) on startup
async function initDatabase() {
  try {
    console.log('[DB Provisioning] Running database migrations...');
    await db.migrate.latest();
    console.log('[DB Provisioning] Database migrations completed successfully!');

    // Check if the criteria table is seeded
    const criteriaCount = await db('criteria').count('id as count').first();
    const countVal = criteriaCount ? parseInt(criteriaCount.count) : 0;
    
    if (countVal === 0) {
      console.log('[DB Provisioning] Empty database detected. Seeding initial hackathon data...');
      await db.seed.run();
      console.log('[DB Provisioning] Seed data injected successfully!');
    } else {
      console.log('[DB Provisioning] Database already contains seed data. Skipping seed step.');
    }
  } catch (error) {
    console.error('[DB Provisioning] Critical failure seeding or migrating database:', error);
    // Do not crash the server instantly, let Express listen so health check can show failures
  }
}

// 6. Start listening
app.listen(PORT, async () => {
  console.log(`==================================================`);
  console.log(`   GenAI Hackathon Server listening on port ${PORT} `);
  console.log(`   API Endpoint: http://localhost:${PORT}/api      `);
  console.log(`==================================================`);
  
  await initDatabase();
});
