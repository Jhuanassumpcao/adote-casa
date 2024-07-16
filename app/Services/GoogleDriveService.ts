import { google } from 'googleapis';
import { promises as fs, createReadStream } from 'fs';
import path from 'path';

const credentials = require('../../credentials.json');
const { client_secret, client_id } = credentials.web;
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, 'http://localhost:3333/oauth2callback');

class GoogleDriveService {
  public static async uploadFile(filePath: string, mimeType: string, folderId: string) {
    const tokens = await fs.readFile('tokens.json', 'utf-8');
    oAuth2Client.setCredentials(JSON.parse(tokens));

    const drive = google.drive({ version: 'v3', auth: oAuth2Client });
    const fileMetadata = {
      name: path.basename(filePath),
      parents: [folderId], 
    };
    const media = {
      mimeType: mimeType,
      body: createReadStream(filePath),
    };

    try {
      const response = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id',
      });
      console.log('File uploaded:', response.data);

      const filesList = await drive.files.list({
        q: `'${folderId}' in parents`,
        fields: 'files(id, name)',
      });
      console.log('Files in folder:', filesList.data.files);

      return response.data;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  public static async generatePublicUrl(fileId: string) {
    const tokens = await fs.readFile('tokens.json', 'utf-8');
    oAuth2Client.setCredentials(JSON.parse(tokens));

    const drive = google.drive({ version: 'v3', auth: oAuth2Client });

    try {

      await drive.permissions.create({
        fileId: fileId,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });

      const result = await drive.files.get({
        fileId: fileId,
        fields: 'webViewLink, webContentLink',
      });

      return result.data;
    } catch (error) {
      console.error('Error generating public URL:', error);
      throw error;
    }
  }
}

export default GoogleDriveService;
