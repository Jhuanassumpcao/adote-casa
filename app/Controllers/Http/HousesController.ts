import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import House from 'App/Models/House'

export default class HousesController {
    // GET /houses
    public async index({response, request}: HttpContextContract) {
        const {state, city, ownerid, limitvalue, page, perPage} = request.qs();
        console.log(state, city)
        
        const query = House.query().preload('recipient');

        if (state){
            query.where('state', state);
        }

        if (city){
            query.where('city', city);
        }

        if (ownerid){
            query.where('cadastred_by_user_id', ownerid);
        }

        if (limitvalue){
            query.where('value', '<=', limitvalue);
        }

        const currentPage = page || 1;
        const resultsPerPage = perPage || 10;

        // Executa a consulta com paginação
        const houses = await query.paginate(currentPage, resultsPerPage);

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

    public async mine({auth, response}: HttpContextContract) {
        try{
            await auth.use('api').authenticate()
            const user = auth.use('api').user

            if (!user) {
                throw new Error('You are not authorized!')
            }

            const houses = await House.query().where('cadastred_by_user_id', user.id)
            return response.ok(houses)
        } catch { 
            return response.unauthorized({ message: 'You are not authorized!' })
        }
    }
}
