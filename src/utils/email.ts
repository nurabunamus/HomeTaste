import { Response } from 'express';
import createTransporter from '../config/email';

const sendEmail = async (
  email: string,
  subject: string,
  link: string,
  res: Response
): Promise<void> => {
  try {
    // Initialize the Nodemailer with your Gmail credentials
    const Transport = await createTransporter();

    const mailOptions = {
      from: 'HomeTaste', // Change this to your desired 'from' name
      to: email,
      subject,
      html: `Click the following link to proceed: <a href="${link}">${subject}</a>`,
    };

    // Send the email
    await Transport.sendMail(mailOptions);
    return;
  } catch (error) {
    res.status(400).send(error);
  }
};

export default sendEmail;
