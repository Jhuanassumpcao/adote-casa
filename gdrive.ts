const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const TOKEN_PATH = './token.json';
const fs = require('fs');
const credentials = require('./credentials.json');
const { google } = require('googleapis');
 
function getOAuthClient() {
    const { client_secret, client_id, redirect_uris } = credentials.web;
    return new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
}
 
async function getAuthorization(response) {
    const oAuth2Client = getOAuthClient();
 
    if (!fs.existsSync(TOKEN_PATH)) {
        const url = await oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES,
        });
        return response.redirect(url);
    }
 
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH));
    oAuth2Client.setCredentials(token);
 
    return oAuth2Client;
}
 
async function getAccessToken(request, response) {
    try {
        const oAuth2Client = getOAuthClient();
        const {tokens} = await oAuth2Client.getToken(request.query.code);
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
        return getAuthorization(response);
    } catch (err) {
        return console.error('Error retrieving access token', err);
    }
}
 
module.exports = { getAccessToken, getAuthorization }
 