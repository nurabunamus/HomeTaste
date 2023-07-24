/* eslint-disable node/no-unsupported-features/es-syntax */
/* eslint-disable prettier/prettier */
/* eslint-disable object-shorthand */
/* eslint-disable camelcase */
/* eslint-disable no-underscore-dangle */
/* eslint-disable import/prefer-default-export */
import { Request, Response } from 'express';
import User from '../models/user';
import { IAddress, IUser } from '../types/interfaces';

interface updateProfile {
  address: IAddress;
  phone: string;
  profile_image: string;
  cooker_status: string;
  first_name: string;
  last_name: string;
}

export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const userReq = req.user as IUser;
    const { first_name, last_name, phone, cooker_status, address } = req.body;

    // Assigns the server path of the uploaded profile image to the 'profile_image' property in the request body (if available).
    req.body.profile_image = req.file?.path;

    // Create an object to hold the updated fields
    const updatedFields: updateProfile = {
      first_name: first_name,
      last_name: last_name,
      phone: phone,
      address: address,
      profile_image: req.body.profile_image,
      cooker_status: cooker_status,
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
