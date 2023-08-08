import { Request, Response } from 'express';
import User from '../models/user';
import { IAddress, IUser } from '../types/interfaces';

interface userProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  cookerStatus: string;
  address: IAddress;
  profileImage: string;
}
interface updateProfile {
  address: IAddress;
  phone: string;
  profileImage: string;
  cookerStatus: string;
  firstName: string;
  lastName: string;
}
const getUserProfile = async (req: Request, res: Response) => {
  try {
    // Get the user information from the request
    const userReq = req.user as IUser;
    const user = await User.findById({ _id: userReq._id });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Create a userProfile object using data from the user document
    const profile: userProfile = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      cookerStatus: user.cookerStatus,
      address: user.address,
      profileImage: user.profileImage,
    };

    return res.status(200).json({
      message: 'User retrieved successfully',
      data: profile,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const userReq = req.user as IUser;
    const {
      firstName,
      lastName,
      phone,
      cookerStatus,
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
    // Assigns the server path of the uploaded profile image to the 'profileImage' property in the request body (if available).
    req.body.profileImage = req.file?.path;

    // Ckeck cooker status
    const cookStatus = userReq.role === 'customer' ? ' ' : cookerStatus;

    // Create an object to hold the updated fields
    const updatedFields: updateProfile = {
      firstName,
      lastName,
      phone,
      address,
      profileImage: req.body.profileImage,
      cookerStatus: cookStatus,
    };
    // Find the user by _id and update the specified fields
    const updatedUser = await User.findOneAndUpdate(
      { _id: userReq._id },
      { $set: updatedFields },
      { new: true }
    );
    // If the user is not found, return a 404 error
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      message: 'Profile updated successfully!',
      data: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export default { getUserProfile, updateUserProfile };
