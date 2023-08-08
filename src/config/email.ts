import nodemailer from 'nodemailer';
import { google } from 'googleapis';

const { OAuth2 } = google.auth;

const createTransporter = async () => {
  const oauth2Client = new OAuth2(
    process.env.OAUTH_CLIENT_ID!,
    process.env.OAUTH_CLIENT_SECRET!,
    'https://developers.google.com/oauthplayground'
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.OAUTH_REFRESH_TOKEN!,
  });

  const accessToken = await new Promise<string>((resolve, reject) => {
    oauth2Client.getAccessToken((err: Error | null, token?: string | null) => {
      if (err || !token) {
        reject(err || new Error('Access token is missing.'));
      } else {
        resolve(token);
      }
    });
  });

  const Transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.GMAIL_EMAIL!,
      accessToken,
      clientId: process.env.OAUTH_CLIENT_ID!,
      clientSecret: process.env.OAUTH_CLIENT_SECRET!,
      refreshToken: process.env.OAUTH_REFRESH_TOKEN!,
    },
  });

  return Transport;
};

export default createTransporter;
