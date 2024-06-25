import { DateTime } from 'luxon'
import { BaseModel, column, BelongsTo, belongsTo, } from '@ioc:Adonis/Lucid/Orm'
import House from './House'

export default class Donation extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public house_id: number

  @column()
  public receipt: string

  @belongsTo(() => House, {
    localKey: 'house_id',
    foreignKey: 'id',
  })
  public house: BelongsTo<typeof House>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime


}
