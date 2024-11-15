import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, HasMany, hasMany, column } from '@ioc:Adonis/Lucid/Orm'
import Recipient from './Recipient'
import Donation from './Donation'

export default class House extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public cadastred_by_user_id: number

  @column()
  public house_id: number

  @column()
  public title: string

  @column()
  public description: string

  @column()
  public pixkey: string

  @column()
  public address: string

  @column()
  public city: string

  @column()
  public state: string

  @column()
  public file_url: Buffer

  @column()
  public value: number

  @column()
  public bairro: string

  @column()
  public cep: string

  @column()
  public number: string

  @belongsTo(() => Recipient, {
    localKey: 'user_id',
    foreignKey: 'cadastred_by_user_id',
  })
  public recipient: BelongsTo<typeof Recipient>

  @hasMany(() => Donation, {
    foreignKey: 'house_id',
  })
  public donations: HasMany<typeof Donation>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
