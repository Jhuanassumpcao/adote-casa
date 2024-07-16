import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import Application from '@ioc:Adonis/Core/Application'
import Env from '@ioc:Adonis/Core/Env'
import Route from '@ioc:Adonis/Core/Route'
import path from 'path'
import { readFile } from 'fs/promises'
import House from 'App/Models/House'
import Recipient from 'App/Models/Recipient'
import Donation from 'App/Models/Donation'
import GoogleDriveService from 'App/Services/GoogleDriveService'
import { file } from 'googleapis/build/src/apis/file'
import sharp from 'sharp'

export default class HousesController {
    // GET /houses
    public async index({response, request}: HttpContextContract) {
        const {state, city, ownerid, maxValue, page, perPage} = request.qs();
        
        const query = Database
            .from('houses')
            .leftJoin('donations', 'houses.id', 'donations.house_id')
            .leftJoin('users', 'houses.cadastred_by_user_id', 'users.id')
            .select('houses.*')
            .select(Database.raw('COALESCE(SUM(donations.donation_value), 0) as total_donations'))
            .groupBy('houses.id')

        if (state){
            query.where('state', state);
        }

        if (city){
            query.where('city', city);
        }

        if (ownerid){
            query.where('cadastred_by_user_id', ownerid);
        }

        if (maxValue){
            query.where('value', '<=', maxValue);
        }

        const currentPage = page || 1;
        const resultsPerPage = Math.max(1, Math.min(perPage || 10, 50));

        //busca em ordem aqui
        const houses = await Database
            .from(query.as('subquery'))
            .whereRaw('subquery.total_donations < subquery.value')
            .orderBy('subquery.total_donations')
            .leftJoin('recipients', 'subquery.cadastred_by_user_id', 'recipients.user_id')
            .select('subquery.*')
            .select('recipients.name as owner_name')
            .paginate(currentPage, resultsPerPage)

        

        // houses.file_url contains the path to the image on system
        houses.forEach(house => {
          if (house.file_url) {
              house.file_url = Route.makeSignedUrl('getImage', { id: house.id }, { expiresIn: '30mins' });
              const baseUrl = `${request.protocol()}://${request.host()}`;
              house.file_url = `${baseUrl}${house.file_url}`;
          }
      });
        return response.ok(houses)
    }
    
    // POST /houses
    public async store({ auth, request, response }: HttpContextContract) {
      try {
        await auth.use('api').authenticate()
        const user = auth.use('api').user
        if (!user) {
          throw new Error('You are not authorized!')
        }
  
        // Valida os dados da requisição
        const houseData = request.only([
          'title',
          'description',
          'pixkey',
          'address',
          'city',
          'state',
          'value',
          'bairro',
          'cep',
          'number'
        ])

        // const image = request.file('file_url', {
          //   size: '2mb',
          //   extnames: ['jpg', 'png', 'jpeg'],
          // });
      
          // let file_url: string | null | undefined = null;
      
          // if (image) {
          //   await image.moveToDisk('uploads');
          //   const filePath = `tmp/uploads/uploads/${image.fileName}`;
          //   const mimeType = image.headers['content-type'];
      
          //   const fileData = await GoogleDriveService.uploadFile(filePath, mimeType, '1Ih_Tu0kaL1-y2H5jKmWqALLfhAJVi10K');
          //   file_url = fileData.id;
          // }

  
        // Lida com o upload do arquivo de imagem
        const image = request.file('file_url', {
          extnames: ['image'],
          size: '2mb'
        })
        
        if (image) {
          // Lê o arquivo de imagem como buffer
          const imageBuffer = await readFile(image.tmpPath!)
          houseData['file_url']= imageBuffer
        }
  
        houseData['cadastred_by_user_id'] = user.id
  
        const house = new House()
        house.merge(houseData)
        await house.save()
  
        return response.created({ message: 'House created successfully!', house })
      } catch (error) {
        console.error('Error creating house:', error)
        return response.unauthorized({ message: 'You are not authorized!' })
      }
    }
    

    // GET /houses/:id
    public async show({ params, response }: HttpContextContract) {
      try {
        const house = await House.findOrFail(params.id)
        const receiptName = await Recipient.findOrFail(house.cadastred_by_user_id)
        const donations = await Donation.query().where('house_id', house.id).select('donation_value').exec()
  
        let fileUrl;
  
        // Converte a imagem para base64
        if (house.file_url) {
          fileUrl = `data:image/jpeg;base64,${house.file_url.toString('base64')}`
        }
  
        const return_data = {
          ...house.toJSON(),
          owner_name: receiptName.name,
          total_donations: donations.reduce((acc, donation) => acc + parseInt(donation.donationValue.toString()), 0),
          file_url: fileUrl,
        }
  
        return response.ok(return_data)
      } catch (error) {
        console.error('Error fetching house details:', error)
        return response.internalServerError('Failed to fetch house details')
      }
    }
    // PUT /houses/:id
    public async update({params, request, response}: HttpContextContract) {

        const data = request.all()
        const house = await House.findOrFail(params.id)

        const image = request.file('file_url', {
          extnames: ['image'],
          size: '2mb'
        })
        
        if (image) {
          // Lê o arquivo de imagem como buffer
          const imageBuffer = await readFile(image.tmpPath!)
          house['file_url']= imageBuffer
        }
  
        house.merge(data)

        await house.save()
        return response.ok(house)
    }

    // DELETE /houses/:id
    public async destroy({auth, params, response}: HttpContextContract) {
        try{
            await auth.use('api').authenticate()
            const user = auth.use('api').user

            if (!user) {
                throw new Error('You are not authorized!')
            }

            const house = await House.findOrFail(params.id)

            if (house.cadastred_by_user_id !== user.id) {
                throw new Error('You are not authorized!')
            }

            await house.delete()
            return response.noContent()
        } catch {
            return response.unauthorized({ message: 'You are not authorized!' })
        }
        
    }

    public async mine({auth, response}: HttpContextContract) {
        try{
            await auth.use('api').authenticate()
            const user = auth.use('api').user

            if (!user) {
                throw new Error('You are not authorized!')
            }
            
            const houses = await Database
                .from('houses')
                .select('houses.*')
                .where('cadastred_by_user_id', user.id)
                .leftJoin('donations', 'houses.id', 'donations.house_id')
                .select('houses.*')
                .select(Database.raw('COALESCE(SUM(donations.donation_value), 0) as total_donations'))
                .groupBy('houses.id')

            return response.ok(houses)
        } catch { 
            return response.unauthorized({ message: 'You are not authorized!' })
        }
    }
}
