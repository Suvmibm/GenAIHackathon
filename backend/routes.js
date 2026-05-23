const express = require('express');
const router = express.Router();

module.exports = function(db) {
  // 1. Healthcheck and Migrations validation
  router.get('/health', async (req, res) => {
    try {
      // Basic query to check if DB is connected
      await db.raw('SELECT 1');
      res.json({ status: 'healthy', database: 'connected' });
    } catch (error) {
      console.error('Health Check DB Error:', error);
      res.status(500).json({ status: 'unhealthy', database: 'disconnected', error: error.message });
    }
  });

  // 2. Fetch all metadata (Houses, Teams, Juries, and Criteria) in a single request for fast app load
  router.get('/metadata', async (req, res) => {
    try {
      const houses = await db('houses').select('*').orderBy('id');
      const teams = await db('teams').select('*').orderBy('name');
      const juries = await db('juries').select('*').orderBy('id');
      const criteria = await db('criteria').select('*').orderBy('id');

      res.json({ houses, teams, juries, criteria });
    } catch (error) {
      console.error('Metadata fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch application metadata' });
    }
  });

  // 3. Fetch criteria list separately
  router.get('/criteria', async (req, res) => {
    try {
      const criteria = await db('criteria').select('*').orderBy('id');
      res.json(criteria);
    } catch (error) {
      console.error('Criteria fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch criteria list' });
    }
  });

  // 4. Submit Evaluation
  router.post('/submissions', async (req, res) => {
    const { jury_id, team_id, house_id, comments, scores } = req.body;

    // Validation
    if (!jury_id || !team_id || !house_id) {
      return res.status(400).json({ error: 'Missing required fields: jury_id, team_id, and house_id are mandatory.' });
    }

    if (!scores || typeof scores !== 'object') {
      return res.status(400).json({ error: 'Missing or invalid scores payload. Must be a key-value object of criterion_id: score.' });
    }

    // Check that we have valid scores
    const criteriaIds = Object.keys(scores);
    if (criteriaIds.length === 0) {
      return res.status(400).json({ error: 'At least one criterion must be scored.' });
    }

    // Check if jury already evaluated this team
    try {
      const existingSubmission = await db('submissions')
        .where({ jury_id, team_id })
        .first();

      if (existingSubmission) {
        return res.status(400).json({ 
          error: 'Duplicate Submission', 
          message: 'You have already submitted an evaluation for this team. Editing evaluations is currently not permitted.' 
        });
      }
    } catch (error) {
      console.error('Submissions lookup error:', error);
      return res.status(500).json({ error: 'Database verification failed.' });
    }

    // Transaction to insert submission and itemized scores safely
    const trx = await db.transaction();
    try {
      // 1. Insert into submissions
      const [submissionIdObj] = await trx('submissions').insert({
        jury_id,
        team_id,
        house_id,
        comments: comments || ''
      }).returning('id');

      // SQLite returns a simple integer or object depending on driver, handle both
      const submission_id = typeof submissionIdObj === 'object' ? (submissionIdObj.id || submissionIdObj[0]) : submissionIdObj;

      // 2. Prepare scores rows
      const scoresData = criteriaIds.map(critId => {
        const scoreVal = parseInt(scores[critId]);
        if (isNaN(scoreVal) || scoreVal < 1 || scoreVal > 5) {
          throw new Error(`Invalid score value for criterion ID ${critId}. Must be an integer between 1 and 5.`);
        }
        return {
          submission_id,
          criterion_id: parseInt(critId),
          score: scoreVal
        };
      });

      // 3. Batch insert scores
      await trx('scores').insert(scoresData);

      // Commit transaction
      await trx.commit();
      res.status(201).json({ success: true, message: 'Evaluation submitted successfully!', submission_id });
    } catch (error) {
      // Rollback transaction on failure
      await trx.rollback();
      console.error('Submission transaction error:', error);
      res.status(400).json({ error: error.message || 'Failed to record submission scores.' });
    }
  });

  // 5. Submissions detail — filterable by house_id, team_id, jury_id
  router.get('/submissions/detail', async (req, res) => {
    try {
      const { house_id, team_id, jury_id } = req.query;

      let query = db('submissions')
        .join('juries', 'submissions.jury_id', '=', 'juries.id')
        .join('teams', 'submissions.team_id', '=', 'teams.id')
        .join('houses', 'submissions.house_id', '=', 'houses.id')
        .select(
          'submissions.id as submission_id',
          'submissions.comments',
          'submissions.created_at',
          'juries.id as jury_id',
          'juries.name as jury_name',
          'teams.id as team_id',
          'teams.name as team_name',
          'houses.id as house_id',
          'houses.name as house_name'
        )
        .orderBy('submissions.created_at', 'desc');

      if (house_id) query = query.where('submissions.house_id', parseInt(house_id));
      if (team_id)  query = query.where('submissions.team_id',  parseInt(team_id));
      if (jury_id)  query = query.where('submissions.jury_id',  parseInt(jury_id));

      const submissions = await query;

      if (submissions.length === 0) return res.json([]);

      const submissionIds = submissions.map(s => s.submission_id);

      const scores = await db('scores')
        .join('criteria', 'scores.criterion_id', '=', 'criteria.id')
        .whereIn('scores.submission_id', submissionIds)
        .select(
          'scores.submission_id',
          'scores.score',
          'criteria.id as criterion_id',
          'criteria.question',
          'criteria.category'
        )
        .orderBy('criteria.id');

      const result = submissions.map(sub => {
        const subScores = scores.filter(s => s.submission_id === sub.submission_id);
        const total = subScores.reduce((sum, s) => sum + s.score, 0);
        return {
          submissionId: sub.submission_id,
          juryId: sub.jury_id,
          juryName: sub.jury_name,
          teamId: sub.team_id,
          teamName: sub.team_name,
          houseId: sub.house_id,
          houseName: sub.house_name,
          comments: sub.comments,
          submittedAt: sub.created_at,
          totalScore: total,
          averageScore: subScores.length > 0 ? parseFloat((total / subScores.length).toFixed(2)) : 0,
          scores: subScores.map(s => ({
            criterionId: s.criterion_id,
            question: s.question,
            category: s.category,
            score: s.score
          }))
        };
      });

      res.json(result);
    } catch (error) {
      console.error('Submissions detail error:', error);
      res.status(500).json({ error: 'Failed to fetch submission details' });
    }
  });

  // 6. Leaderboard / Analytics dashboard
  router.get('/leaderboard', async (req, res) => {
    try {
      // Calculate overall average scores per team
      // To ensure PostgreSQL and SQLite compatibility, we calculate averages carefully
      const rawStandings = await db('submissions')
        .join('scores', 'submissions.id', '=', 'scores.submission_id')
        .join('teams', 'submissions.team_id', '=', 'teams.id')
        .join('houses', 'submissions.house_id', '=', 'houses.id')
        .select(
          'teams.id as team_id',
          'teams.name as team_name',
          'houses.name as house_name'
        )
        .countDistinct('submissions.id as evaluations_count')
        .sum('scores.score as total_score')
        .avg('scores.score as avg_score')
        .groupBy('teams.id', 'teams.name', 'houses.name')
        .orderBy('avg_score', 'desc');

      // Calculate details per criterion for analytics mapping
      const rawCriterionAverages = await db('submissions')
        .join('scores', 'submissions.id', '=', 'scores.submission_id')
        .join('criteria', 'scores.criterion_id', '=', 'criteria.id')
        .select(
          'submissions.team_id',
          'criteria.id as criterion_id',
          'criteria.question as criterion_question'
        )
        .avg('scores.score as criterion_avg')
        .groupBy('submissions.team_id', 'criteria.id', 'criteria.question');

      // Map average scores by team and inject detailed breakdown
      const standings = rawStandings.map(t => {
        const teamId = t.team_id;
        const criteriaBreakdown = rawCriterionAverages
          .filter(c => c.team_id === teamId)
          .map(c => ({
            id: c.criterion_id,
            question: c.criterion_question,
            avgScore: parseFloat(parseFloat(c.criterion_avg).toFixed(2))
          }));

        return {
          teamId,
          teamName: t.team_name,
          houseName: t.house_name,
          evaluationsCount: parseInt(t.evaluations_count),
          totalScore: parseInt(t.total_score),
          averageScore: parseFloat(parseFloat(t.avg_score).toFixed(2)),
          breakdown: criteriaBreakdown
        };
      });

      res.json(standings);
    } catch (error) {
      console.error('Leaderboard query error:', error);
      res.status(500).json({ error: 'Failed to compile leaderboard results' });
    }
  });

  return router;
};
