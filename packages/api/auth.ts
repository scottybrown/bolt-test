import { jwtVerify } from 'jose';

export async function verifyAuth0Token(token: string) {
  if (!process.env.AUTH0_ISSUER_BASE_URL || !process.env.AUTH0_AUDIENCE) {
    throw new Error('Auth0 environment variables not set');
  }

  const JWKS = new URL('.well-known/jwks.json', process.env.AUTH0_ISSUER_BASE_URL).toString();
  
  try {
    const result = await jwtVerify(token, JWKS, {
      issuer: process.env.AUTH0_ISSUER_BASE_URL,
      audience: process.env.AUTH0_AUDIENCE,
    });
    
    return result.payload;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

export type AuthContext = {
  auth: {
    userId: string;
    email: string;
  } | null;
};