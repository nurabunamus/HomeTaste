import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt, { Secret } from 'jsonwebtoken';
import { IAddress } from '../types/interfaces';
import { setTokenCookie, setCompletedTokenCookie } from '../utils/auth';
import User from '../models/user';
import sendEmail from '../utils/email';
import { encrypt, decrypt } from '../utils/confirmation';
import Cart from '../models/cart';

interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

// Register1 contains => (fullName, email, password)
const register1 = async (req: Request, res: Response) => {
  try {
    const { email, password, fullName } = req.body as RegisterRequest;

    // Perform validation checks on the request data
    if (!fullName || !email || !password) {
      return res.status(400).send({ error: 'Missing required fields' });
    }

    // Check if the email already exists in the database
    const existingUser = await User.findOne({ email });
    if (existingUser && Object.keys(existingUser).length > 0) {
      return res.status(409).send({ error: 'User already exists' });
    }

    // Generate a hashed password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user instance using the User model
    const savedUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
    });

    // Save the new user to the database
    const userIdString: string = savedUser._id.toString();

    // Set the token as a cookie in the response
    setTokenCookie({
      userId: userIdString,
      fullName: savedUser.fullName,
      email: savedUser.email,
      res,
    });

    req.user = savedUser;
    const subject = 'Email Verification';
    const apiUrl = process.env.API_URL;
    const confirmationToken = encrypt(email);
    const link = `${apiUrl}/verify/${confirmationToken}`;
    await sendEmail(email, subject, link, res);

    // Return the response
    return res.status(201).json({
      message: 'User successfully signed up',
      user: {
        id: savedUser._id,
        fullName: savedUser.fullName,
        email: savedUser.email,
      },
    });
  } catch (error) {
    return res.status(500).json(error);
  }
};

const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get the confirmation token
    const { confirmationToken } = req.params;
    // Decrypt the username
    const email = decrypt(confirmationToken);
    const user = await User.findOne({ email });

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
    res.status(400).send(err);
  }
};

// completedRegister contains => (address,phone,role)
const completedRegister = async (req: Request, res: Response) => {
  try {
    // const { address, phone, role } = req.body as Register2Request;
    const {
      phone,
      role,
      streetName,
      streetNumber,
      city,
      state,
      flatNumber,
      district,
      zip,
    } = req.body;
    const address: IAddress = {
      streetName,
      streetNumber,
      state,
      city,
      flatNumber,
      district,
      zip,
    };
    const { authToken } = req.signedCookies;
    if (!phone || !address || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (role === 'admin') {
      return res.status(400).json({
        error: 'Cannot register as an admin during user registration.',
      });
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
      return res.status(404).json({ error: 'User not found' });
    }

    // Add the address and phone to the user object
    user.address = address;
    user.phone = phone;
    user.role = role;
    user.isRegistrationComplete = true;

    // Save the updated user to the database
    await user.save();

    // Clear the existing cookie
    res.clearCookie('authToken');

    // Set the new token as a cookie in the response
    setCompletedTokenCookie({
      userId,
      role: user.role,
      fullName: user.fullName,
      res,
    });

    // Create the cart for the customer
    if (user.role === 'customer') {
      await Cart.create({ items: [], customerId: userId });
    }

    req.user = user;

    // Return the response
    return res.status(201).json({
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
    return res.status(500).send(error);
  }
};

const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Perform validation checks on the request data
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Find the user based on the email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found, please register' });
    }

    const isSignedWithGoogleOrFacebook = user.providerId;
    if (isSignedWithGoogleOrFacebook) {
      return res.status(404).json({
        error: 'Use the appropriate method for login, Google or Facebook',
      });
    }

    // Compare the provided password with the hashed password stored in the database
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate a new token for the authenticated user
    const userIdString: string = user._id.toString();

    if (user.isRegistrationComplete) {
      setCompletedTokenCookie({
        userId: userIdString,
        role: user.role,
        fullName: user.fullName,
        res,
      });
    } else {
      setTokenCookie({
        userId: userIdString,
        fullName: user.fullName,
        email: user.email,
        res,
      });
    }

    // Store the user information in req.user
    req.user = {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    };

    // Return the response
    return res.status(200).json({
      message: 'User successfully logged in',
      user: req.user,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const logout = (req: Request, res: Response) => {
  try {
    // Clear the authToken cookie to log out the user
    res.clearCookie('authToken');
    res.clearCookie('authTokenCompleted');

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
