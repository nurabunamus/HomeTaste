import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/user';
import PasswordResetToken from '../models/passwordResetToken';
import { generateResetToken } from '../utils/confirmation';
import sendEmail from '../utils/email';

const sendPasswordResetEmail = async (
  email: string,
  res: Response
): Promise<void> => {
  const resetToken = generateResetToken();
  const apiUrl = process.env.API_URL;

  const subject = 'Password Reset';
  const link = `${apiUrl}/reset-password/${resetToken}`;

  await sendEmail(email, subject, link, res);
};

const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate reset token and store it in the database
    const resetToken = generateResetToken();
    const expirationTime = Date.now() + 3600000; // 1 hour expiration time
    const passwordResetToken = new PasswordResetToken({
      userId: user._id,
      token: resetToken,
      expiresAt: expirationTime,
    });
    await passwordResetToken.save();

    await sendPasswordResetEmail(email, res);

    return res.json({ message: 'Password reset email sent' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Controller to reset the password using the token
const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;
    const passwordResetToken = await PasswordResetToken.findOne({ token });

    if (
      !passwordResetToken ||
      passwordResetToken.expiresAt.getTime() < Date.now()
    ) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Find the corresponding user using the userId stored in the passwordResetToken
    const user = await User.findById(passwordResetToken.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate a hashed password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);
    // Update the user's password and save
    user.password = hashedPassword;
    await user.save();

    // Delete the used passwordResetToken from the database
    await PasswordResetToken.deleteOne({ _id: passwordResetToken._id });

    return res.json({ message: 'Password reset successful' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export default { requestPasswordReset, sendPasswordResetEmail, resetPassword };
