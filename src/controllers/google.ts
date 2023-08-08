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

const saveGoogle = async (req: Request, res: Response) => {
  try {
    const userReq = req.user as IUser & { _json: JsonType };
    const googleId = `google-${userReq._json.sub}`;
    const user = await User.findOne({ providerId: googleId });

    // User does not exist with Google authentication
    if (!user) {
      const existingUserWithEmail = await User.findOne({
        email: userReq._json.email,
      });
      // Create a new user with Google authentication if user does not exist with the same email address
      if (!existingUserWithEmail) {
        const newUser = await User.create({
          firstName: userReq._json.given_name,
          lastName: userReq._json.family_name,
          email: userReq._json.email,
          providerId: googleId,
          isConfirmed: true,
        });
        // Set authToken
        setTokenCookie({
          userId: newUser._id,
          fullName: newUser.fullName,
          email: newUser.email,
          res,
        });

        res.status(200).json({
          message: 'User successfully signed in',
          user: {
            id: newUser._id,
            fullName: newUser.fullName,
            email: newUser.email,
          },
        });
      } else if (existingUserWithEmail.providerId) {
        res.status(400).send({
          error:
            'User already exists with Facebook. Please sign in with your Facebook account.',
        });
      } else {
        res.status(400).send({
          error:
            'User already exists with Email and Password. Please sign in with your registered email and password.',
        });
      }
    } else if (user.isRegistrationComplete) {
      // If the user's registration is complete (logged in Google authentication)
      // Generate a new token for the authenticated user and set it as the authTokenCompleted
      const userIdString: string = user._id.toString();

      setCompletedTokenCookie({
        userId: userIdString,
        role: user.role,
        fullName: user.fullName,
        res,
      });

      // Store the user information in req.user
      req.user = {
        id: user._id,
        fullName: user.fullName,
        role: user.role,
      };

      // Return the response
      res.status(200).json({
        message: 'User successfully logged in',
        user: req.user,
      });
    } else {
      // If the user's registration is not complete
      // Generate a new token for the authenticated user and set it as the authToken
      const userIdString: string = user._id.toString();

      setTokenCookie({
        userId: userIdString,
        fullName: user.fullName,
        email: user.email,
        res,
      });

      // Store the user information in req.user
      req.user = {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
      };

      res.status(200).json({
        message: 'User successfully logged in',
        user: req.user,
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export default saveGoogle;
