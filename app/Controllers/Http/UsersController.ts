import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'

export default class UsersController {
    public async login({request, response, auth}: HttpContextContract) {
        const { email, password } = request.only(['email', 'password'])
        console.log("iiainnnnn meesinnn")
        try {
            const token = await auth.attempt(email, password)
            const user = await User.findBy('email', email)

            console.log(user)
            return response.ok({token: token, user_id: user?.id })
        } catch (error) {
            return response.badRequest(error)
        }
    }
}
