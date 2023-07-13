import express, { Request, Response } from 'express';
import User from '../models/user';

import bcrypt from 'bcrypt';
import jwt, { Secret } from 'jsonwebtoken';
import { IAddress, IUser } from '../types/interfaces';
import {setTokenCookie} from '../utils/auth';

interface RegisterRequest extends Request {
  user: IUser;
  body: {
    email: string;
    password: string;
    fullName: string;
  };
}

interface Register2Request extends Request {
  user: IUser;
  body: {
    address: IAddress;
    phone: string;
    role: string;
  };
}

interface RequestWithUser extends Request {
  user: {
    id: string;
    fullName: string;
    email: string;
    role: string;
  };
}

// Register1 contains => (fullName, email, password)
const register1 = async (req: RegisterRequest, res: Response) => {
  try {
    const { email, password, fullName } = req.body;

    // Perform validation checks on the request data
    if (!fullName || !email || !password) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Check if the email already exists in the database
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
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
    setTokenCookie(userIdString, newUser.role, newUser.fullName, res);

    req.user = savedUser;
    // Return the response
    res.status(201).json({
      message: 'User successfully signed up',
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// completedRegister contains => (address,phone,role)
const completedRegister = async (req: Register2Request, res: Response) => {
  try {
    const { address, phone, role } = req.body;
    const authToken = req.signedCookies['auth_token'];

    if (!phone || !address || !role) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Extract user data from the auth_token
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

    // Save the updated user to the database
    await user.save();

    // Clear the existing cookie
    setTokenCookie(userId, user.role, user.fullName, res, true);

    // Set the new token as a cookie in the response
    setTokenCookie(userId, user.role, user.fullName, res);
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
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const login = async (req: RequestWithUser, res: Response) => {
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
      res.status(404).json({ error: 'User not found' });
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
    setTokenCookie(userIdString, user.role, user.fullName, res);

    // Store the user information in req.user
    req.user = {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    };
    console.log(user);

    // Return the response
    res.status(200).json({
      message: 'User successfully logged in',
      user: req.user,
    });
  } catch (error) {
    console.log('error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const logout = (req: Request, res: Response) => {
  try {
    // Clear the auth_token cookie to log out the user
    res.clearCookie('auth_token');

    // Return the response
    res.status(200).json({ message: 'User successfully logged out' });
  } catch (error) {
    res.send(error);
  }
};

module.exports = {
  register1,
  completedRegister,
  login,
  logout,
};
