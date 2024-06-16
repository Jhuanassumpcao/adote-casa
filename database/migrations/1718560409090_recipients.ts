import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'recipients'
  
  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table
      .integer('user_id')
      .unsigned()
      .primary()
      .references('id')
      .inTable('users')
      .onUpdate('CASCADE')
      .onDelete('CASCADE')
      .unique()
      .notNullable()

      table.string('name').notNullable()
      table.string('state').notNullable()
      table.string('city').notNullable()
      table.string('phone').nullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }


  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
