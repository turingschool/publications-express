exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('papers', function(table) {
      table.string('publisher');
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('papers', function(table) {
      table.dropColumn('publisher');
    })
  ]);
};
