import crypto from 'crypto';

const algorithm = process.env.CRYPTO_ALGORITHM;
const secretKey = process.env.CONFIRMATION_SECRET_KEY;
const iv = process.env.INITIALIZATION_VECTOR;

const encrypt = (token: string): string => {
  const cipher = crypto.createCipheriv(
    algorithm!,
    secretKey!,
    Buffer.from(iv!, 'hex')
  );
  const encrypted = Buffer.concat([cipher.update(token), cipher.final()]);

  return encrypted.toString('hex');
};

const decrypt = (hash: string): string => {
  const decipher = crypto.createDecipheriv(
    algorithm!,
    secretKey!,
    Buffer.from(iv!, 'hex')
  );

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(hash, 'hex')),
    decipher.final(),
  ]);

  return decrypted.toString();
};

const generateResetToken = () => {
  const tokenBytes = 32; // Adjust the number of bytes as per your requirement (32 bytes = 256 bits, a common size for secure tokens)
  return crypto.randomBytes(tokenBytes).toString('hex');
};

export { encrypt, decrypt, generateResetToken };
