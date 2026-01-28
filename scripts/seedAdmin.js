import mongoose from 'mongoose';
import dotenv from 'dotenv';
import db from '../src/modules/index.js';
import { hashPassword } from '../src/utils/hash.util.js';

dotenv.config();

const { users: Users } = db;

const requiredEnv = ['SERVER_DB_URL', 'ADMIN_EMAIL', 'ADMIN_PASSWORD', 'ADMIN_NAME'];
const missing = requiredEnv.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`Missing env vars: ${missing.join(', ')}`);
  process.exit(1);
}

const run = async () => {
  const uri = process.env.SERVER_DB_URL || process.env.DB_URI;
  if (!uri) {
    throw new Error('SERVER_DB_URL (or DB_URI) is not set');
  }
  await mongoose.connect(uri);
  const existing = await Users.findOne({ email: process.env.ADMIN_EMAIL });
  if (existing) {
    console.log('Admin already exists:', existing.email);
    await mongoose.disconnect();
    return;
  }

  const passwordHash = await hashPassword(process.env.ADMIN_PASSWORD);
  const admin = await Users.create({
    name: process.env.ADMIN_NAME,
    email: process.env.ADMIN_EMAIL,
    password: passwordHash,
    role: 'admin',
    isActive: true,
    accountStatus: 'active'
  });
  console.log('Admin created:', admin.email);
  await mongoose.disconnect();
};

run().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect();
  process.exit(1);
});
