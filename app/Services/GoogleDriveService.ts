import { google } from 'googleapis';
import * as fs from 'fs';
import { OAuth2Client } from 'google-auth-library';

class GoogleDriveService {
  private oAuth2Client: OAuth2Client;

  constructor() {
    this.oAuth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
  }

  getAuthUrl() {
    return this.oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/drive.file'],
    });
  }

  async getToken(code: string) {
    const { tokens } = await this.oAuth2Client.getToken(code);
    return tokens;
  }

  setCredentials(tokens: any) {
    this.oAuth2Client.setCredentials(tokens);
  }

  async uploadFile(filePath: string, mimeType: string) {
    const drive = google.drive({ version: 'v3', auth: this.oAuth2Client });

    const fileMetadata = {
      name: 'photo.jpg',
    };

    const media = {
      mimeType: mimeType,
      body: fs.createReadStream(filePath),
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id',
    });

    return response.data;
  }
}

export default new GoogleDriveService();
