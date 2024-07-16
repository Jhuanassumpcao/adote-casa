import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { MultipartFileContract } from '@ioc:Adonis/Core/BodyParser';
import { promises as fs } from 'fs';
import path from 'path';
import { tmpdir } from 'os';

const credentials = require('../../../credentials.json');

const { client_secret, client_id, redirect_uris } = credentials.web;
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, 'http://localhost:3333/oauth2callback');

export default class GoogleDriveController {
  // Gera o URL de autorização do Google e redireciona o usuário para ele
  public async getAuthUrl({ response }: HttpContextContract) {
    response.header('Access-Control-Allow-Origin', '*');
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/drive.file'],
    });
    return authUrl;

  }

  public async oauth2callback({ request, response }: HttpContextContract) {
    const { code } = request.qs();
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
    
    // Save the tokens to a file or database
    await fs.writeFile('tokens.json', JSON.stringify(tokens));
  
    response.header('Access-Control-Allow-Origin', '*');
    return response.redirect('http://localhost:5173/requirement');
  }
  

  public async upload({ request, response }: HttpContextContract) {
    const tokens = await fs.readFile('tokens.json', 'utf-8');
    oAuth2Client.setCredentials(JSON.parse(tokens));
  
    const file = request.file('file');
    if (!file) {
      return response.badRequest('No file uploaded');
    }
  
    const folderId = '1Ih_Tu0kaL1-y2H5jKmWqALLfhAJVi10K'; // ID da pasta no Google Drive
    const fileBuffer = await this.convertToBuffer(file);
    const fileId = await this.uploadFile(fileBuffer, file.clientName, folderId);
  
    response.header('Access-Control-Allow-Origin', '*');
    if (fileId) {
      return response.json({ fileId });
    } else {
      return response.internalServerError('Failed to upload file');
    }
  }
  
  // Faz download do arquivo do Google Drive
  public async downloadFile(fileId: string, response: any) {
    const tokens = await fs.readFile('tokens.json', 'utf-8');
    oAuth2Client.setCredentials(JSON.parse(tokens));
  
    try {
      const drive = google.drive({ version: 'v3', auth: oAuth2Client });
      const fileResponse = await drive.files.get(
        { fileId: fileId, alt: 'media' },
        { responseType: 'stream' }
      );
  
      response.type('image/jpeg'); // Adjust the MIME type based on your file type
      fileResponse.data.pipe(response);
    } catch (error) {
      console.error('Error downloading file:', error);
      throw new Error('Failed to download file');
    }
  }
  

  // Função auxiliar para fazer upload do arquivo
  private async uploadFile(fileBuffer: Buffer, fileName: string, folderId: string): Promise<string | null> {
    const drive = google.drive({ version: 'v3', auth: oAuth2Client });
    const fileMetadata = {
      name: fileName,
      parents: [folderId],
    };
    const media = {
      mimeType: 'image/jpeg',
      body: fileBuffer,
    };

    try {
      const response = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id',
      });

      console.log('File uploaded successfully, File ID:', response.data.id);
      return response.data.id || null;
    } catch (error) {
      console.error('Error uploading file:', error);
      return null;
    }
  }

  // Converte o arquivo para buffer
  private async convertToBuffer(file: MultipartFileContract): Promise<Buffer> {
    // Define a localização temporária
    const tmpFilePath = path.join(tmpdir(), `${Date.now()}-${file.clientName}`);
  
    // Move o arquivo para o local temporário
    await file.move(tmpdir(), {
      name: `${Date.now()}-${file.clientName}`,
      overwrite: true,
    });
  
    // Leia o arquivo e converta para um buffer
    const buffer = await fs.readFile(tmpFilePath);
  
    // Opcional: Apague o arquivo temporário após a leitura
    await fs.unlink(tmpFilePath);
  
    return buffer;
  }
}
