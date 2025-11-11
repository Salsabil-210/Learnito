import { OAuth2Client } from 'google-auth-library';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

export async function verifyGoogleToken(idToken: string) {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload) throw new Error('Invalid Google token');
  
  return {
    email: payload.email!,
    firstName: payload.given_name || '',
    lastName: payload.family_name || '',
    avatar: payload.picture || null,
    emailVerified: payload.email_verified || false,
  };
}
