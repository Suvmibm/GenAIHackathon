exports.seed = async function(knex) {
  // Deletes ALL existing entries in reverse dependency order
  await knex('scores').del();
  await knex('submissions').del();
  await knex('criteria').del();
  await knex('juries').del();
  await knex('teams').del();
  await knex('houses').del();

  // Insert Houses
  await knex('houses').insert([
    { id: 1, name: 'Build.ai' },
    { id: 2, name: 'Run.ai' },
    { id: 3, name: 'Shape.ai' },
    { id: 4, name: 'Assure.ai' }
  ]);

  // Insert Teams (3 per house)
  await knex('teams').insert([
    { id: 101, name: 'SDLC Crew',                    house_id: 1 },
    { id: 102, name: 'The Compile Crew',             house_id: 1 },
    { id: 103, name: 'VAS-GenAI-Code and Cognition', house_id: 1 },
    { id: 201, name: 'AI Warrior',                   house_id: 2 },
    { id: 202, name: 'Crash Analytics Lab',          house_id: 2 },
    { id: 203, name: 'Neural Nova',                  house_id: 2 },
    { id: 301, name: 'OpenAPI Genie',                house_id: 3 },
    { id: 302, name: 'AI Squad',                     house_id: 3 },
    { id: 303, name: 'Solution Engine',              house_id: 3 },
    { id: 401, name: 'Data Blues',                   house_id: 4 },
    { id: 402, name: 'Trailblazers',                 house_id: 4 },
    { id: 403, name: 'Studio Synapse',               house_id: 4 }
  ]);

  // Insert Juries / Judges
  await knex('juries').insert([
    { id: 1,  name: 'Hitesh TK' },
    { id: 2,  name: 'Tejasvi Bishnoi' },
    { id: 3,  name: 'Aneesh Kumar' },
    { id: 4,  name: 'Rishi Aurora' },
    { id: 5,  name: 'Kurup Prasad' },
    { id: 6,  name: 'Shamindra Basu' },
    { id: 7,  name: 'Nirupmay Kumar' },
    { id: 8,  name: 'Sanjeev Vadera' },
    { id: 9,  name: 'Himanshu Jain' },
    { id: 10, name: 'Kapil Singhal' },
    { id: 11, name: 'Gautam Sehdev' },
    { id: 12, name: 'Harish Pani' },
    { id: 13, name: 'Abhishek Mathur' },
    { id: 14, name: 'Jignesh Karia' },
    { id: 15, name: 'Surendra Reddy Kaipa' },
    { id: 16, name: 'Mayank Mathur' }
  ]);

  // Insert Evaluation Criteria
  await knex('criteria').insert([
    {
      id: 1,
      question: 'Does the GenAI Idea address a meaningful delivery or business challenge with clear value potential?',
      category: 'Business Relevance & Impact',
      icon: 'idea'
    },
    {
      id: 2,
      question: 'Does the ICA assistant demonstrate a compelling and effective approach to solving the identified problem?',
      category: 'AI Solution Effectiveness',
      icon: 'persona'
    },
    {
      id: 3,
      question: 'Is the assistant intuitive, usable, and practical for the intended users?',
      category: 'User Experience & Adoption Readiness',
      icon: 'benefit'
    },
    {
      id: 4,
      question: 'Can the solution be scaled or extended across teams, functions, or portfolios?',
      category: 'Scalability & Enterprise Potential',
      icon: 'scalability'
    },
    {
      id: 5,
      question: 'Does the solution demonstrate strong innovation, implementation quality, and contextual understanding?',
      category: 'Innovation & Solution Maturity',
      icon: 'qa'
    }
  ]);
};
