import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class RecipientsInfoValidator {
  constructor(protected ctx: HttpContextContract) {}

  /*
   * Define schema to validate the "shape", "type", "formatting" and "integrity" of data.
   *
   * For example:
   * 1. The username must be of data type string. But then also, it should
   *    not contain special characters or numbers.
   *    ```
   *     schema.string([ rules.alpha() ])
   *    ```
   *
   * 2. The email must be of data type string, formatted as a valid
   *    email. But also, not used by any other user.
   *    ```
   *     schema.string([
   *       rules.email(),
   *       rules.unique({ table: 'users', column: 'email' }),
   *     ])
   *    ```
   */
  public schema = schema.create({
    email: schema.string({ trim: true }),
    password: schema.string({}, [rules.minLength(6)]),
    name: schema.string({ trim: true }),
    state: schema.string({ trim: true }),
    city: schema.string({ trim: true }),
    phone: schema.string.optional({ trim: true }),
  })

  /**
   * Custom messages for validation failures. You can make use of dot notation `(.)`
   * for targeting nested fields and array expressions `(*)` for targeting all
   * children of an array. For example:
   *
   * {
   *   'profile.username.required': 'Username is required',
   *   'scores.*.number': 'Define scores as valid numbers'
   * }
   *
   */
  public messages: CustomMessages = {
    'email.required': 'Email is required',
    'email.string': 'Email must be a string',
    'email.email': 'Email must be a valid email',
    'password.required': 'Password is required',
    'password.minLength': 'Password must be at least 6 characters',
    'name.required': 'Name is required',
    'name.string': 'Name must be a string',
    'state.required': 'State is required',
    'state.string': 'State must be a string',
    'city.required': 'City is required',
    'city.string': 'City must be a string',
    'phone.string': 'Phone must be a string',
  }
}
