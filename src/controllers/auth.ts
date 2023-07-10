import express, { Request, Response } from 'express';
import User from '../models/user';

import bcrypt from 'bcrypt';
import jwt, { Secret } from 'jsonwebtoken';

const setTokenCookie = (
  userId: string,
  role: string,
  fullName: string,
  res: Response
): void => {
  const payload = {
    _id: userId,
    fullName: fullName,
    role: role,
  };

  const token = jwt.sign(payload, process.env.SECRET_KEY as Secret, {
    expiresIn: '14 days',
  });
  res.cookie('auth_token', token, {
    httpOnly: true,
    signed: true,
    expires: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    secure: false,
    // We should add them when we are going to deploy our app
    // secure: process.env.DEPLOYED === 'yes',
    // sameSite: 'none',
  });
};

// Register1 contains => (fullName, email, password, role)
const register1 = async (req: Request, res: Response) => {
  try {
    const { email, password, fullName, role } = req.body;

    // Perform validation checks on the request data
    if (!fullName || !email || !password || !role) {
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
      role,
    });

    // Save the new user to the database
    await newUser.save();

    // Set the token as a cookie in the response
    setTokenCookie(newUser._id, newUser.role, newUser.fullName, res);

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

// Register2 contains => (address,phone)
const register2 = async (req: Request, res: Response) => {
  try {
    const { address, phone } = req.body;
    const authToken = req.signedCookies['auth_token'];

    if (!phone || !address) {
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

    // Save the updated user to the database
    await user.save();

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

module.exports = {
  register1,
  register2,
};
