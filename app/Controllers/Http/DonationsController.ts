import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Application from '@ioc:Adonis/Core/Application'
import Donation from 'App/Models/Donation'
import House from 'App/Models/House'

import fs from 'fs'
import path from 'path'

export default class DonationsController {
    public async index({}: HttpContextContract) {
        return 'Hello world'
    }

    public async show({ params, response }: HttpContextContract) {
        const receiptName = params.receiptName
        console.log(params)
        const filePath = path.join(Application.tmpPath('uploads'), receiptName)

        try {
            if (fs.existsSync(filePath)) {
                return response.download(filePath)
            } else {
                return response.status(404).json({ error: 'File not found' })
            }
        } catch (err) {
            return response.status(500).json({ error: 'An error occurred while retrieving the file' })
        }
    }

    public async store({ request, response }: HttpContextContract) {
        const image = request.file('image', {
            size: '2mb',
            extnames: ['jpg', 'png', 'jpeg'],
        })

        if (!image) {
            return response.status(400).json({ error: 'Image is required' })
        }

        const fileName = new Date().getTime().toString() + '.' + image.extname

        await image.move(Application.tmpPath('uploads'), {
            name: fileName,
        })


        const donation = await Donation.create({
            house_id: request.input('house_id'),
            fileName: fileName,
            description: request.input('description'),
            donationValue: request.input('donationValue'),
        })

        return response.status(201).json(donation)
    }
}
