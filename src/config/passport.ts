import { Request } from 'express';
import passport from 'passport';
import passportGoogle from 'passport-google-oauth20';
import passportFacebook, { Profile } from 'passport-facebook';
import { HydratedDocument } from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/user';
import { IUser } from '../types/interfaces';
import { setCompletedTokenCookie, setTokenCookie } from '../utils/auth';

dotenv.config();

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  BASE_URL,
  CLIENT_ID_FB,
  CLIENT_SECRET_FB,
} = process.env;

// Configure Passport to use Google Strategy for authentication.
const GoogleStrategy = passportGoogle.Strategy;
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID as string,
      clientSecret: GOOGLE_CLIENT_SECRET as string,
      callbackURL: `${BASE_URL}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, cb) => {
      try {
        // Call the callback with the user profile data
        cb(null, profile as Profile);
      } catch (error) {
        cb(null, error as Error);
      }
    }
  )
);

// Configure Passport to use Facebook Strategy for authentication.
const FacebookStrategy = passportFacebook.Strategy;
passport.use(
  new FacebookStrategy(
    {
      clientID: CLIENT_ID_FB as string,
      clientSecret: CLIENT_SECRET_FB as string,
      callbackURL: `${BASE_URL}/api/auth/facebook/callback`,
      profileFields: ['id', 'displayName', 'photos', 'email', 'name'],
      passReqToCallback: true,
    },
    async (req: Request, accessToken, refreshToken, profile: Profile, done) => {
      try {
        const existingUser = await User.findOne({ providerId: profile.id });
        // Check if user has a facebook provider id
        if (existingUser) {
          let newToken;
          // Check if user completed /register2
          if (existingUser.isRegistrationComplete) {
            newToken = setCompletedTokenCookie({
              userId: existingUser._id,
              fullName: existingUser.fullName,
              email: existingUser.email,
              role: existingUser.role,
            });
          } else {
            newToken = setTokenCookie({
              userId: existingUser._id,
              fullName: existingUser.fullName,
              email: existingUser.email,
            });
          }
          return done(null, newToken);
        }
        // if a user doesnt have a facebook provider id, check the email info from the profile
        const existingEmailUser = await User.findOne({
          email: profile._json.email,
        });
        // if user exists with this email, the login attempt will be unsuccesful
        if (existingEmailUser) {
          return done(null, false);
        }
        // Else, create a new user and make a new token for them.
        let createdUser: HydratedDocument<IUser> | null | undefined = null;
        if (profile && profile.name) {
          createdUser = await User.create({
            email: profile._json.email,
            providerId: profile.id,
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            profileImage: `https://graph.facebook.com/${profile.id}/picture?type=large`,
            isConfirmed: true,
          });
        }
        if (!createdUser) {
          throw new Error(
            'Cant make a new account due to a database issue, please try again later'
          );
        }

        const token = setTokenCookie({
          userId: createdUser._id,
          fullName: createdUser.fullName,
          email: createdUser.email,
        });
        return done(null, token);
      } catch (err) {
        return done(err);
      }
    }
  )
);

export default passport;
