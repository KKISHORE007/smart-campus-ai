// ============================================================
// Student Helpdesk Agent — Standalone Seed Script
// ============================================================
// Run via CLI: node src/scripts/seed.js [--force]
// ============================================================

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from '../config/db.js';
import { seedDatabase } from '../services/seedService.js';
import logger from '../utils/logger.js';
import mongoose from 'mongoose';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

async function run() {
  const force = process.argv.includes('--force');
  logger.info(`Starting CLI database seeder | force=${force}`);

  const connected = await connectDB();
  if (!connected) {
    logger.error("Could not connect to MongoDB. Exiting.");
    process.exit(1);
  }

  try {
    const result = await seedDatabase(force);
    logger.info("Seed script completed successfully:", result);
  } catch (err) {
    logger.error("Seed script failed:", err);
  } finally {
    await mongoose.disconnect();
    logger.info("MongoDB disconnected. Exiting process.");
    process.exit(0);
  }
}

run();
