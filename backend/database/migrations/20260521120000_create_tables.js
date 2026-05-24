exports.up = function (knex) {
  return knex.schema
    .createTable('houses', table => {
      table.integer('id').primary();
      table.string('name').notNullable().unique();
    })
    .createTable('teams', table => {
      table.integer('id').primary();
      table.string('name').notNullable().unique();
      table.integer('house_id').references('id').inTable('houses').onDelete('SET NULL');
    })
    .createTable('juries', table => {
      table.integer('id').primary();
      table.string('name').notNullable().unique();
    })
    .createTable('criteria', table => {
      table.integer('id').primary();
      table.string('question', 500).notNullable();
      table.string('category').notNullable();
      table.string('icon').notNullable(); // descriptive keyword for custom UI icons
    })
    .createTable('submissions', table => {
      table.increments('id').primary();
      table.integer('jury_id').references('id').inTable('juries').notNullable();
      table.integer('team_id').references('id').inTable('teams').notNullable();
      table.integer('house_id').references('id').inTable('houses').notNullable();
      table.text('comments');
      table.timestamps(true, true);
      // Prevent duplicate evaluation: One jury can only submit once per team
      table.unique(['jury_id', 'team_id']);
    })
    .createTable('scores', table => {
      table.increments('id').primary();
      table.integer('submission_id').references('id').inTable('submissions').onDelete('CASCADE').notNullable();
      table.integer('criterion_id').references('id').inTable('criteria').notNullable();
      table.integer('score').notNullable();
    });
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists('scores')
    .dropTableIfExists('submissions')
    .dropTableIfExists('criteria')
    .dropTableIfExists('juries')
    .dropTableIfExists('teams')
    .dropTableIfExists('houses');
};
