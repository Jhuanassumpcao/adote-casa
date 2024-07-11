import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import House from 'App/Models/House'

export default class HousesController {
    // GET /houses
    public async index({response}: HttpContextContract) {
        const houses = await House.query().preload('recipient')
        return response.ok(houses)
    }
    
    // POST /houses
    public async store({auth, request, response}: HttpContextContract) {
        try {
            await auth.use('api').authenticate()
            console.log("autenticou")
            const user = auth.use('api').user
            console.log("achou user")


            if (!user) {
                throw new Error('You are not authorized!')
            }
        
            const houseData = request.all()
            const house = new House()
            house.fill(houseData)
            house.cadastred_by_user_id = user.id
            await house.save()
        
        return response.created({ message: 'House created successfully!', house })
        } catch {
            return response.unauthorized({ message: 'You are not authorized!' })
        }
    }
    

    // GET /houses/:id
    public async show({params, response}: HttpContextContract) {
        const house = await House.findOrFail(params.id)
        return response.ok(house)
    }
    
    // PUT /houses/:id
    public async update({params, request, response}: HttpContextContract) {
        const data = request.all()
        const house = await House.findOrFail(params.id)
        house.merge(data)
        await house.save()
        return response.ok(house)
    }

    // DELETE /houses/:id
    public async destroy({params, response}: HttpContextContract) {
        const house = await House.findOrFail(params.id)
        await house.delete()
        return response.noContent()
    }
}
