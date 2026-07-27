#!/usr/bin/env node
/**
 * Generate a bcrypt password hash for the Members sheet / ROYALTY_MEMBERS_JSON.
 *
 * Usage:
 *   node scripts/hash-password.mjs "your-password"
 */
import bcrypt from "bcryptjs";

const password = process.argv[2];
if (!password) {
  console.error('Usage: node scripts/hash-password.mjs "your-password"');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 10);
console.log(hash);
