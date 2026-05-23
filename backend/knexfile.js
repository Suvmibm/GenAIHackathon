require('dotenv').config();
const path = require('path');

// Dynamically choose client and connection config based on environment variables
const dbClient = process.env.DB_CLIENT || (process.env.DB_HOST || process.env.DATABASE_URL ? 'pg' : 'sqlite3');

const connectionConfig = dbClient === 'sqlite3'
  ? { filename: path.join(__dirname, 'database.sqlite') }
  : (process.env.DATABASE_URL || {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'hackathon'
    });

module.exports = {
  development: {
    client: dbClient,
    connection: connectionConfig,
    useNullAsDefault: dbClient === 'sqlite3',
    migrations: {
      directory: path.join(__dirname, 'database', 'migrations')
    },
    seeds: {
      directory: path.join(__dirname, 'database', 'seeds')
    }
  },

  production: {
    client: dbClient,
    connection: connectionConfig,
    useNullAsDefault: dbClient === 'sqlite3',
    migrations: {
      directory: path.join(__dirname, 'database', 'migrations')
    },
    seeds: {
      directory: path.join(__dirname, 'database', 'seeds')
    }
  }
};

