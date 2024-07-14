import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'donations'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('house_id')
        .unsigned()
        .references('id')
        .inTable('houses')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
        .notNullable()
      table.string('file_name').notNullable()
      table.string('description').notNullable()
      table.decimal('donation_value', 12, 2).notNullable()

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
