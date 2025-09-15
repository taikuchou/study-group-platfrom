import https from 'https';

export interface GoogleTokenPayload {
  iss: string;
  azp: string;
  aud: string;
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
  iat: number;
  exp: number;
}

export class GoogleAuthUtils {
  private static readonly GOOGLE_TOKEN_INFO_URL = 'https://oauth2.googleapis.com/tokeninfo';

  /**
   * Verify Google OAuth token by calling Google's tokeninfo endpoint
   * This is a simplified version that doesn't require the google-auth-library dependency
   */
  static async verifyGoogleToken(token: string): Promise<GoogleTokenPayload | null> {
    try {
      const url = `${this.GOOGLE_TOKEN_INFO_URL}?id_token=${token}`;
      
      return new Promise((resolve, reject) => {
        https.get(url, (res) => {
          let data = '';
          
          res.on('data', (chunk) => {
            data += chunk;
          });
          
          res.on('end', () => {
            try {
              if (res.statusCode !== 200) {
                console.error('Google token verification failed:', res.statusCode, data);
                resolve(null);
                return;
              }
              
              const payload = JSON.parse(data) as GoogleTokenPayload;
              
              // Verify token is not expired
              if (payload.exp < Math.floor(Date.now() / 1000)) {
                console.error('Google token is expired');
                resolve(null);
                return;
              }
              
              // Verify email is verified
              if (!payload.email_verified) {
                console.error('Google email is not verified');
                resolve(null);
                return;
              }
              
              resolve(payload);
            } catch (error) {
              console.error('Error parsing Google token response:', error);
              resolve(null);
            }
          });
        }).on('error', (error) => {
          console.error('Error verifying Google token:', error);
          resolve(null);
        });
      });
    } catch (error) {
      console.error('Google token verification error:', error);
      return null;
    }
  }
  
  /**
   * Extract user information from Google token payload
   */
  static extractUserInfo(payload: GoogleTokenPayload) {
    return {
      googleId: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      givenName: payload.given_name,
      familyName: payload.family_name,
    };
  }
}