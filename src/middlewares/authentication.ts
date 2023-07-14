import { Request } from 'express';
import passport from 'passport';
import passportFacebook, { Profile } from 'passport-facebook';
import passportJWT from 'passport-jwt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { HydratedDocument } from 'mongoose';
import User from '../models/user';
import { IUser } from '../types/interfaces';

dotenv.config();

/* This File Contains The Implementations For All tThe Strategies, Current Passport Strategies That Are Used In This Project Are:
    1- Facebook, To Provide Facebook Login Service
    2- Google, To Provide Google Login Service
    3- JWT, To Check The JWT Token
*/

// Facebook Strategy
const FacebookStrategy = passportFacebook.Strategy;
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.CLIENT_ID_FB!,
      clientSecret: process.env.CLIENT_SECRET_FB!,
      callbackURL: 'http://localhost:3000/api/auth/facebook/callback',
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
        const existingUser = await User.findOne({ provider_id: profile.id });

        if (existingUser) {
          return done(undefined, existingUser);
        }
        const existingEmailUser = await User.findOne({
          email: profile._json.email,
        });

        if (existingEmailUser) {
          throw new Error(
            'There is already another user with this email address, please use another email'
          );
        }
        const createdUser: HydratedDocument<IUser> = await User.create({
          email: profile._json.email,
          provider_id: profile.id,
          role: 'customer',
          first_name: profile.name!.givenName,
          last_name: profile.name!.familyName,

          profile_image: `https://graph.facebook.com/${profile.id}/picture?type=large`,
        });

        if (!createdUser) {
          throw new Error(
            'Cant create an account due to a database issue, please try again later'
          );
        }

        const expiresIn = 14 * 24 * 60 * 60; // 14 days in seconds
        const now = Math.floor(Date.now() / 1000); // Convert milliseconds to seconds
        const expiresAt = now + expiresIn;

        const user = {
          email: createdUser.email,
          providerId: `facebook-${createdUser.provider_id}`,
          avatar: createdUser.profile_image,
          role: createdUser.role,
        };

        const token = jwt.sign(
          {
            ...user,
            exp: expiresAt,
            iat: now,
          },
          process.env.JWT_SECRET_KEY!
        );
        return done(null, token);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// Google Strategy

// JWT Strategy
const JWTStrategy = passportJWT.Strategy;
const jwtOptions = {
  jwtFromRequest: (req: any) => req.cookies.token,
  secretOrKey: process.env.JWT_SECRET_KEY!,
};

passport.use(
  new JWTStrategy(jwtOptions, async (token: any, done: any) => {
    const user = await User.findOne({ email: token.email });
    try {
      if (user) {
        return done(undefined, user, token);
      }
      return done(undefined, false);
    } catch (err) {
      return done(err, false);
    }
  })
);

export default passport;
