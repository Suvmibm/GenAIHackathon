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
    { id: 1, name: 'Red House (Branding & Retail)' },
    { id: 2, name: 'Blue House (Systems & Security)' },
    { id: 3, name: 'Orange House (Customer Experience)' },
    { id: 4, name: 'Green House (Eco & Optimization)' }
  ]);

  // Insert Teams
  await knex('teams').insert([
    { id: 101, name: 'AI Pioneers (Red)', house_id: 1 },
    { id: 102, name: 'Brand Architects (Red)', house_id: 1 },
    { id: 201, name: 'ICA Titans (Blue)', house_id: 2 },
    { id: 202, name: 'Shield Defenders (Blue)', house_id: 2 },
    { id: 301, name: 'Cognitive Crafters (Orange)', house_id: 3 },
    { id: 302, name: 'Chatbot Wizards (Orange)', house_id: 3 },
    { id: 401, name: 'Eco Optimizers (Green)', house_id: 4 },
    { id: 402, name: 'Smart Grid Ops (Green)', house_id: 4 }
  ]);

  // Insert Juries
  await knex('juries').insert([
    { id: 1, name: 'Jury A - Technical Panel' },
    { id: 2, name: 'Jury B - Design & UX Panel' },
    { id: 3, name: 'Jury C - Business Value Panel' },
    { id: 4, name: 'Jury D - Executive Panel' }
  ]);

  // Insert Evaluation Criteria — exactly 5 questions matching the Figma design
  await knex('criteria').insert([
    {
      id: 1,
      question: 'Does the GenAI Idea address a meaningful delivery or business challenge with clear value potential?',
      category: 'Business Value',
      icon: 'idea'
    },
    {
      id: 2,
      question: 'Does the ICA assistant demonstrate a compelling and effective approach to solving the identified problem?',
      category: 'Solution Approach',
      icon: 'persona'
    },
    {
      id: 3,
      question: 'Is the assistant intuitive, usable, and practical for the intended users?',
      category: 'Usability',
      icon: 'benefit'
    },
    {
      id: 4,
      question: 'Can the solution be scaled or extended across teams, functions, or portfolios?',
      category: 'Scalability & Extension',
      icon: 'scalability'
    },
    {
      id: 5,
      question: 'Does the solution demonstrate strong innovation, implementation quality, and contextual understanding?',
      category: 'Innovation & Quality',
      icon: 'qa'
    }
  ]);
};
