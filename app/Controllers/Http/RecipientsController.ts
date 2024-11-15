import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import Recipient from 'App/Models/Recipient'
import User from 'App/Models/User'
import RecipientsInfoValidator from 'App/Validators/RecipientsInfoValidator'

export default class RecipientsController {
    public async index({response}: HttpContextContract) {
        const recipients = await Recipient.all()
        return response.ok(recipients)
    }
    
    public async store({request, response}: HttpContextContract) {
        const recipientsData =  await request.validate(RecipientsInfoValidator)
        const trx = await Database.transaction()
        try{
            const user = await User.create({email: recipientsData.email, password: recipientsData.password}, {client: trx} )
            const recipient = await Recipient.create({name: recipientsData.name, state: recipientsData.state, city: recipientsData.city, phone: recipientsData.phone, user_id: user.id}, {client: trx})
            await trx.commit()
            return response.created(recipient)
        } catch (error) {
            await trx.rollback()
            return response.badRequest(error)
        }
        
    }
    
    public async show({params, response}: HttpContextContract) {
        const recipient = await Recipient.findOrFail(params.id)
        return response.ok(recipient)
    }
    
    public async update({auth, request, response}: HttpContextContract) {
        const data = request.except(['email'])
        const email = request.input('email')
        await auth.use('api').authenticate()
        const user = auth.use('api').user
        if (email) {
            const userRecord = await User.findOrFail(user?.id)
            userRecord.email = email
            await userRecord.save()
        }
        const recipient = await Recipient.findOrFail(user?.id)
        recipient.merge(data)
        await recipient.save()
        return response.ok(recipient)
    }
    
    public async destroy({params, response}: HttpContextContract) {
        const recipient = await Recipient.findOrFail(params.id)
        await recipient.delete()
        return response.noContent()
    }

    public async view({response, auth}: HttpContextContract) {
        try {
            await auth.use('api').authenticate()
            const user = auth.use('api').user
            const recipient = await Recipient.findBy('user_id', user?.id);

            if (!user || !recipient) {
                throw new Error('You are not authorized!')
            }

            const data = {
                email : user.email,
                name: recipient.name,
                state: recipient.state,
                city: recipient.city,
                phone: recipient.phone,
                createdAt: recipient.createdAt,
            }
        
            return response.ok(data)
        } catch {
            return response.unauthorized({ message: 'You are not authorized!' })
        }
    }
}
