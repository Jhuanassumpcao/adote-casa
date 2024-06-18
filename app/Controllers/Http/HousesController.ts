import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import House from 'App/Models/House'

export default class HousesController {
    public async index({response}: HttpContextContract) {
        const houses = await House.query().preload('recipient')
        return response.ok(houses)
    }
    
    public async store({request, response}: HttpContextContract) {
        const data = request.all()
        const house = await House.create(data)
        return response.created(house)
    }
    
    public async show({params, response}: HttpContextContract) {
        const house = await House.findOrFail(params.id)
        return response.ok(house)
    }
    
    public async update({params, request, response}: HttpContextContract) {
        const data = request.all()
        const house = await House.findOrFail(params.id)
        house.merge(data)
        await house.save()
        return response.ok(house)
    }
    
    public async destroy({params, response}: HttpContextContract) {
        const house = await House.findOrFail(params.id)
        await house.delete()
        return response.noContent()
    }
}
