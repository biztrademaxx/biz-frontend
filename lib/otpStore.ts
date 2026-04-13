// /lib/otpStore.ts
import fs from 'fs';
import path from 'path';

interface OtpEntry {
  otp: string;
  expiresAt: number;
}

interface OtpStore {
  [email: string]: OtpEntry;
}

const storagePath = path.join(process.cwd(), 'tmp', 'otpStore.json');

// Ensure tmp directory exists
const ensureStorageDir = () => {
  const dir = path.dirname(storagePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Read from storage
export const readOtpStore = (): OtpStore => {
  try {
    ensureStorageDir();
    if (fs.existsSync(storagePath)) {
      const data = fs.readFileSync(storagePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading OTP store:', error);
  }
  return {};
};

// Write to storage
export const writeOtpStore = (store: OtpStore): void => {
  try {
    ensureStorageDir();
    fs.writeFileSync(storagePath, JSON.stringify(store, null, 2));
  } catch (error) {
    console.error('Error writing OTP store:', error);
  }
};

// Clean expired OTPs
export const cleanExpiredOtps = (): void => {
  const store = readOtpStore();
  const now = Date.now();
  let changed = false;

  Object.keys(store).forEach(email => {
    if (store[email].expiresAt < now) {
      delete store[email];
      changed = true;
    }
  });

  if (changed) {
    writeOtpStore(store);
  }
};