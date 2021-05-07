// eslint-disable-next-line no-unused-vars
const Knex = require('knex');
const tableNames = require('../../src/constants/tableNames');

// Add created_at, updated_at, & deleted_at
function addDefaultColumns(table) {
  table.timestamps(false, true);
  table.dateTime('deleted_at');
}

function createNameTable(knex, tableName) {
  return knex.schema.createTable(tableName, (table) => {
    table.increments().notNullable();
    table.string('name').notNullable().unique();

    addDefaultColumns(table);
  });
}

function url(table, columnName) {
  table.string(columnName, 2000);
}

function email(table, columnName) {
  return table.string(columnName, 254);
}

function references(table, foreignTableName) {
  table
    .integer(`${foreignTableName}_id`)
    .unsigned()
    .references('id')
    .inTable(foreignTableName)
    .onDelete('cascade');
}

/**
 * @param { Knex } knex
 */
exports.up = async (knex) => {
  // Create all of the tables that do not have foreign keys
  await Promise.all([
    knex.schema.createTable(tableNames.user, (table) => {
      // Add the id column, auto increments, and is the primary key
      table.increments().notNullable();
      email(table, 'email').notNullable().unique();
      table.string('name').notNullable();
      table.string('password', 60).notNullable();
      table.dateTime('last_login');
      addDefaultColumns(table);
    }),
    createNameTable(knex, tableNames.item_type),
    createNameTable(knex, tableNames.country),
    createNameTable(knex, tableNames.state),
    createNameTable(knex, tableNames.shape),
    knex.schema.createTable(tableNames.location, (table) => {
      // Add the id column, auto increments, and is the primary key
      table.increments().notNullable();
      table.string('name').notNullable().unique();
      table.string('description', 1000);
      url(table, 'image_url');
      addDefaultColumns(table);
    }),
  ]);

  await knex.schema.createTable(tableNames.address, (table) => {
    // Add the id column, auto increments, and is the primary key
    table.increments().notNullable();
    table.string('street_address_1', 50).notNullable();
    table.string('street_address_2', 50);
    table.string('city', 50).notNullable();
    table.string('zipcode', 15).notNullable();
    table.float('latitude').notNullable();
    table.float('longitude').notNullable();
    references(table, tableNames.state);
    references(table, tableNames.country);
  });

  await knex.schema.createTable(tableNames.manufacturer, (table) => {
    // Add the id column, auto increments, and is the primary key
    table.increments().notNullable();
    table.string('name').notNullable();
    url(table, 'logo_url');
    table.string('description', 1000);
    url(table, 'website_url');
    // `type` text
    email(table, 'email');
    references(table, tableNames.address);
  });
};

exports.down = async (knex) => {
  await Promise.all([
    tableNames.manufacturer,
    tableNames.address,
    tableNames.user,
    tableNames.item_type,
    tableNames.country,
    tableNames.state,
    tableNames.shape,
    tableNames.location,
  ].map((tableName) => knex.schema.dropTable(tableName)));
};
