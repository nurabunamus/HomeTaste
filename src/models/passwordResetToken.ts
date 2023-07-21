/* eslint-disable node/no-unsupported-features/es-syntax */
import { Schema, model } from 'mongoose';
import { IPasswordResetToken } from '../types/interfaces';

// Define the schema for the PasswordResetToken
const passwordResetTokenSchema = new Schema<IPasswordResetToken>({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  token: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

// Create the PasswordResetToken model based on the schema
const PasswordResetToken = model<IPasswordResetToken>(
  'PasswordResetToken',
  passwordResetTokenSchema
);

export default PasswordResetToken;
