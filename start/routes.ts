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
// import Recipient from 'App/Models/Recipient'

Route.get('/', async () => {
  return { hello: 'world' }
})

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

// LOGIN
Route.post('/login', 'UsersController.login')

// DONATIONS
Route.resource('donations', 'DonationsController').apiOnly()
Route.get('/donation/:receiptName', 'DonationsController.show')
