import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import GoogleDriveService from 'App/Services/GoogleDriveService';

export default class GoogleAuthController {
  public async getAuthUrl({ response }: HttpContextContract) {
    const authUrl = GoogleDriveService.getAuthUrl();
    response.redirect(authUrl);
  }

  public async oauthCallback({ request, response }: HttpContextContract) {
    const { code } = request.qs();
    const tokens = await GoogleDriveService.getToken(code);
    GoogleDriveService.setCredentials(tokens);
    response.send('Autenticação realizada com sucesso!');
  }
}
