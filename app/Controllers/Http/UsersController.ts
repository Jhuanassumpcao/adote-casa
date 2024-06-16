import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UsersController {
    public async login({request, response, auth}: HttpContextContract) {
        const { email, password } = request.only(['email', 'password'])
        console.log(await auth.attempt(email, password))
        try {
            const token = await auth.attempt(email, password)
            return response.ok(token)
        } catch (error) {
            return response.badRequest(error)
        }
    }
}
