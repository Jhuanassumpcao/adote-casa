/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'
import Database from '@ioc:Adonis/Lucid/Database';
import sharp from 'sharp';
// import Recipient from 'App/Models/Recipient'

Route.get('/', async () => {
  return { hello: 'world' }
})
Route.get('image/:id', async ({ params, response }) => {
  const house = await Database
      .from('houses')
      .where('id', params.id)
      .first();

  if (house && house.file_url) {
      const imageBuffer = Buffer.from(house.file_url, 'base64'); // Certifique-se de usar 'base64' para decodificar corretamente
      const resizedBuffer = await sharp(imageBuffer)
          .resize(200) // Redimensiona a imagem para uma largura de 200px
          .toBuffer();
      response.type('image/png');
      return response.send(resizedBuffer);
  } else {
      return response.notFound('Image not found');
  }
}).as('getImage');
// RECIPIENTS
//se mudar a ordem para de funcionar deixar assim
Route.get('/recipients/me', 'RecipientsController.view')
Route.get("/recipients", "RecipientsController.index")
Route.post("/recipients", "RecipientsController.store")
Route.get("/recipients/:id", "RecipientsController.show")
Route.put("/recipients/me", "RecipientsController.update")
Route.delete("/recipients/:id", "RecipientsController.destroy")

// HOUSES
Route.get("/houses", "HousesController.index")
Route.post("/houses", "HousesController.store")
Route.get("/houses/mine", "HousesController.mine")
Route.get("/houses/:id", "HousesController.show")
Route.put("/houses/:id", "HousesController.update")
Route.delete("/houses/:id", "HousesController.destroy")

Route.get('/google-auth', 'GoogleDriveController.getAuthUrl');
Route.get('/oauth2callback', 'GoogleDriveController.oauth2callback');
Route.post('/upload', 'GoogleDriveController.upload');
Route.get('/download/:id', 'GoogleDriveController.download');


// LOGIN
Route.post('/login', 'UsersController.login')

// DONATIONS
Route.resource('donations', 'DonationsController').apiOnly()
Route.get('/donation/:receiptName', 'DonationsController.show')
