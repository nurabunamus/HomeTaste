/* eslint-disable node/no-unsupported-features/es-syntax */
import passport, { Profile } from 'passport';
import passportGoogle from 'passport-google-oauth20';

const GoogleStrategy = passportGoogle.Strategy;
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, BASE_URL } = process.env;

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID as string,
      clientSecret: GOOGLE_CLIENT_SECRET as string,
      callbackURL: `${BASE_URL}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, cb) => {
      try {
        cb(null, profile as Profile);
      } catch (error) {
        cb(null, error as Error);
      }
    }
  )
);
export default passport;
