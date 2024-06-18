import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'houses'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('cadastred_by_user_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
        .notNullable()

      table.string('title').notNullable()
      table.string('description').notNullable()
      table.string('pixkey').notNullable()
      table.string('address').notNullable()
      table.string('city').notNullable()
      table.string('state').notNullable()
      table.string('file_url').nullable()
      table.float('value').nullable()
      table.string('bairro').notNullable()
      table.string('cep').notNullable()
      table.string('number').notNullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
