import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'

export default class UsersController {
    public async login({request, auth}: HttpContextContract) {
        const { email, password } = request.only(['email', 'password'])
        const token = await auth.use('api').attempt(email, password)

        return token.toJSON()
    }
}
