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
  SECRET_KEY,
} = process.env;

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
        console.log('hello from passport google middleware');
        cb(null, profile as Profile);
      } catch (error) {
        // console.log('error ' + error);
        cb(null, error as Error);
      }
    }
  )
);

const FacebookStrategy = passportFacebook.Strategy;
passport.use(
  new FacebookStrategy(
    {
      clientID: CLIENT_ID_FB!,
      clientSecret: CLIENT_SECRET_FB!,
      callbackURL: `${BASE_URL}/api/auth/facebook/callback`,
      profileFields: ['id', 'displayName', 'photos', 'email', 'name'],
      passReqToCallback: true,
    },
    async (
      req: Request,
      accessToken: any,
      refreshToken: any,
      profile: Profile,
      done: any
    ) => {
      try {
        console.log('hello from facebook strategy');
        const existingUser = await User.findOne({ provider_id: profile.id });
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
        console.log('created new user');
        const createdUser: HydratedDocument<IUser> = await User.create({
          email: profile._json.email,
          provider_id: profile.id,
          first_name: profile.name!.givenName,
          last_name: profile.name!.familyName,

          profile_image: `https://graph.facebook.com/${profile.id}/picture?type=large`,
        });

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
