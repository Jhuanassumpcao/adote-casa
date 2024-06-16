import { DateTime } from 'luxon'
import { BaseModel, HasOne, column, hasOne, beforeSave } from '@ioc:Adonis/Lucid/Orm'
import Recipient from './Recipient'
import Hash from '@ioc:Adonis/Core/Hash'


export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public email: string

  @column({ serializeAs: null })
  public password: string

  @hasOne(() => Recipient, {
    localKey: 'id',
    foreignKey: 'user_id',
  })
  public member: HasOne<typeof Recipient>


  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeSave()
  public static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
  }
}
