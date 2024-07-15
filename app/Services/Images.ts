import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';
import { OAuth2Client } from 'google-auth-library';
import Env from '@ioc:Adonis/Core/Env'

interface Credentials {
  installed: {
    client_id: string;
    project_id: string;
    auth_uri: string;
    token_uri: string;
    auth_provider_x509_cert_url: string;
    client_secret: string;
    redirect_uris: string[];
  };
}

const credentials: Credentials = require('../../credentials.json');

const { client_secret, client_id, redirect_uris } = credentials.installed;
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

async function getAccessToken(): Promise<OAuth2Client> {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/drive.file'],
  });

  console.log('Authorize this app by visiting this url:', authUrl);

  // Aqui você precisa pegar o código de autenticação manualmente, ou configurar um endpoint para obter o código
  const code = await new Promise<string>((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code: string) => {
      rl.close();
      resolve(code);
    });
  });

  const tokenResponse = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokenResponse.tokens);
  return oAuth2Client;
}

async function uploadFile(filePath: string): Promise<string | null> {
  
  try {
    const auth = await getAccessToken();
    
    const drive = google.drive({ version: 'v3', auth });
    const fileMetadata = {
        name: path.basename(filePath),
        parents: [folderId],
    };
    const media = {
        mimeType: 'image/jpeg',
        body: fs.createReadStream(filePath),
    };

    const response = await drive.files.create({
      resource: fileMetadata,
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

async function downloadFile(auth: OAuth2Client, fileId: string, destPath: string): Promise<void> {
  const drive = google.drive({ version: 'v3', auth });

  const dest = fs.createWriteStream(destPath);

  try {
    const response = await drive.files.get(
      { fileId: fileId, alt: 'media' },
      { responseType: 'stream' }
    );

    response.data
      .on('end', () => {
        console.log('Download completed.');
      })
      .on('error', (err: any) => {
        console.error('Error downloading file:', err);
      })
      .pipe(dest);
  } catch (error) {
    console.error('Error downloading file:', error);
  }
}

export { getAccessToken, uploadFile, downloadFile };
