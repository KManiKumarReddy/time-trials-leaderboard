import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import CryptoJS from 'crypto-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// This script expects GH_PAT and ADMIN_PASSWORD to be present in the environment (e.g. GitHub Actions secrets).
const pat = process.env.GH_PAT;
const password = process.env.ADMIN_PASSWORD;

console.log("Running Pre-Build Encryption Script...");

if (!pat || !password) {
  console.log("⚠️  GH_PAT or ADMIN_PASSWORD not found in environment.");
  console.log("⚠️  Skipping PAT encryption. (This is expected in local dev, but required for prod builds).");
  process.exit(0);
}

try {
  // Encrypt the PAT using the Admin Password
  const encrypted = CryptoJS.AES.encrypt(pat, password).toString();

  // We write this to a .env.local file so Vite will pick it up and bundle it as an env variable.
  const envFilePath = path.join(__dirname, '..', '.env.local');
  
  // Read existing .env.local if any, to append or replace
  let envContent = '';
  if (fs.existsSync(envFilePath)) {
    envContent = fs.readFileSync(envFilePath, 'utf8');
    // Remove old PAT line if it exists
    envContent = envContent.split('\n').filter(line => !line.startsWith('VITE_ENCRYPTED_PAT')).join('\n');
    if (envContent && !envContent.endsWith('\n')) envContent += '\n';
  }

  envContent += `VITE_ENCRYPTED_PAT="${encrypted}"\n`;

  fs.writeFileSync(envFilePath, envContent);
  console.log("✅ Successfully encrypted GitHub PAT and injected it into .env.local");

} catch (err) {
  console.error("❌ Failed to encrypt PAT:", err);
  process.exit(1);
}
