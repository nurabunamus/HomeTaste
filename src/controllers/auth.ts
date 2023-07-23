import express, { Request, Response } from 'express';

import bcrypt from 'bcrypt';

import jwt, { Secret } from 'jsonwebtoken';
import { IAddress, IUser } from '../types/interfaces';
import { setTokenCookie, setCompletedTokenCookie } from '../utils/auth';
import User from '../models/user';
import sendEmail from '../utils/email';
import { encrypt, decrypt, generateResetToken } from '../utils/confirmation';

interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

interface Register2Request {
  address: IAddress;
  phone: string;
  role: string;
}

// Register1 contains => (fullName, email, password)
const register1 = async (req: Request, res: Response) => {
  try {
    const { email, password, fullName } = req.body as RegisterRequest;

    // Perform validation checks on the request data
    if (!fullName || !email || !password) {
      res.status(400).send({ error: 'Missing required fields' });
      return;
    }

    // Check if the email already exists in the database
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).send({ error: 'User already exists' });
      return;
    }

    // Generate a hashed password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user instance using the User model
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    // Save the new user to the database
    const savedUser: IUser = await newUser.save();

    const userIdString: string = savedUser._id.toString();

    // Set the token as a cookie in the response

    setTokenCookie({
      userId: userIdString,
      fullName: newUser.fullName,
      email: newUser.email,
      res,
    });

    req.user = savedUser;
    const subject = 'Email Verification';
    await sendEmail(email, fullName, subject, res);
    // Return the response
    res.status(201).json({
      message: 'User successfully signed up',
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get the confirmation token
    const { confirmationToken } = req.params;
    // Decrypt the username
    const email = decrypt(confirmationToken);
    const user = await User.findOne({ email: email });

    if (user) {
      // If there is anyone, mark them as confirmed account
      user.isConfirmed = true;
      await user.save();

      // Return the created user data
      res
        .status(201)
        .json({ message: 'User verified successfully', data: user });
    } else {
      res.status(409).send('User Not Found');
    }
  } catch (err) {
    console.error(err);
    res.status(400).send(err);
  }
};

// completedRegister contains => (address,phone,role)
const completedRegister = async (req: Request, res: Response) => {
  try {
    const { address, phone, role } = req.body as Register2Request;
    // eslint-disable-next-line dot-notation
    const { authToken } = req.signedCookies;

    if (!phone || !address || !role) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Extract user data from the authToken
    const decodedToken = jwt.verify(
      authToken,
      process.env.SECRET_KEY as Secret
    ) as {
      _id: string;
      fullName: string;
      role: string;
    };

    const { _id: userId } = decodedToken;

    // Find the user based on the user ID
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Add the address and phone to the user object
    user.address = address;
    user.phone = phone;
    user.role = role;
    user.isRegistrationComplete = true;

    // Save the updated user to the database
    await user.save();

    // // Clear the existing cookie

    res.clearCookie('authToken');

    // Set the new token as a cookie in the response
    setCompletedTokenCookie({
      userId: userId,
      role: user.role,
      fullName: user.fullName,
      res,
    });

    req.user = user;

    // Return the response
    res.status(201).json({
      message: 'User information updated',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        address: user.address,
        phone: user.phone,
        isConfirmed: user.isConfirmed,
      },
    });
  } catch (error) {
    res.status(500).send(error);
  }
};

const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Perform validation checks on the request data
    if (!email || !password) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Find the user based on the email
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ error: 'User not found, please register' });
      return;
    }

    const isSignedWithGoogle = user.provider_id;
    if (isSignedWithGoogle) {
      res.status(404).json({
        error: 'Use the appropriate method for login, Google or Facebook',
      });
      return;
    }

    // Compare the provided password with the hashed password stored in the database
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Generate a new token for the authenticated user
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
      email: user.email,
      role: user.role,
    };

    // Return the response
    res.status(200).json({
      message: 'User successfully logged in',
      user: req.user,
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const logout = (req: Request, res: Response) => {
  try {
    // Clear the authToken cookie to log out the user
    res.clearCookie('authToken');
    res.clearCookie('authTokenCompleted');

    // Return the response
    res.status(200).json({ message: 'User successfully logged out' });
  } catch (error) {
    res.send(error);
  }
};

export default {
  register1,
  completedRegister,
  login,
  logout,
  verifyEmail,
};
