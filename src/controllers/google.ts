/* eslint-disable no-else-return */
/* eslint-disable no-lonely-if */
/* eslint-disable no-underscore-dangle */
/* eslint-disable node/no-unsupported-features/es-syntax */
import { Request, Response } from 'express';
import User from '../models/user';
import { IUser } from '../types/interfaces';
import { setTokenCookie, setCompletedTokenCookie } from '../utils/auth';

/**
 * Saves user data received from Google authentication.
 * If the user does not exist, a new user is created and saved in the database.
 * Generates a JSON Web Token (JWT) for the user and sets it as a cookie in the response.
 * If the user already exists with Facebook or Email and Password, returns an appropriate error response.
 */

type JsonType = {
  family_name: string;
  given_name: string;
  name: string;
  sub: string;
  email: string;
};

async function saveGoogle(req: Request, res: Response) {
  try {
    const userReq = req.user as IUser & { _json: JsonType };
    const googleId = `google-${userReq._json.sub}`;
    const user = await User.findOne({ provider_id: googleId });
    // User does not exist with Google authentication
    if (!user) {
      const existingUserWithEmail = await User.findOne({
        email: userReq._json.email,
      });
      if (!existingUserWithEmail) {
        // Create a new user with Google authentication if user does not exist with the same email address
        const newUser = await User.create({
          first_name: userReq._json.given_name,
          last_name: userReq._json.family_name,
          email: userReq._json.email,
          provider_id: googleId,
        });

        setTokenCookie(newUser._id, newUser.fullName, newUser.email, res);

        res.status(200).json({
          message: 'User successfully signed in',
          user: {
            id: newUser._id,
            fullName: newUser.fullName,
            email: newUser.email,
          },
        });
      } else {
        if (existingUserWithEmail.provider_id) {
          res.status(400).send({
            error:
              'User already exists with Facebook. Please sign in with your Facebook account.',
          });
          return;
        } else {
          res.status(400).send({
            error:
              'User already exists with Email and Password. Please sign in with your registered email and password.',
          });
          return;
        }
      }
    } else {
      if (user.isRegistrationComplete) {
        // User exists with Google authentication
        // Generate a new token for the authenticated user
        const userIdString: string = user._id.toString();
        setCompletedTokenCookie(userIdString, user.role, user.fullName, res);

        // Store the user information in req.user
        req.user = {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        };
        // Return the response
        res.status(200).json({
          message: 'User successfully logged in',
          user: req.user,
        });
      } else {
        // User exists with Google authentication
        // Generate a new token for the authenticated user
        const userIdString: string = user._id.toString();
        setTokenCookie(userIdString, user.fullName, user.email, res);

        // Store the user information in req.user
        req.user = {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
        };
        // Return the response
        res.status(200).json({
          message: 'User successfully logged in',
          user: req.user,
        });
      }
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default saveGoogle;
