import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config as dotenvConfig } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load credentials
dotenvConfig({ path: path.join(__dirname, '..', '.env.local') });

const GIST_ID = process.env.GIST_ID;
const GH_PAT = process.env.GH_PAT;
const OWNER = process.env.GITHUB_REPOSITORY?.split('/')[0];
const LOCAL_FILE = path.join(__dirname, '..', 'data.local.json');

async function pull() {
  if (!GIST_ID || !OWNER) throw new Error('Missing GIST_ID or GITHUB_REPOSITORY');
  
  console.log(`📥 Pulling data from Gist ${GIST_ID}...`);
  const url = `https://gist.githubusercontent.com/${OWNER}/${GIST_ID}/raw/data.json?t=${Date.now()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed: ${res.statusText}`);
  
  const data = await res.json();
  fs.writeFileSync(LOCAL_FILE, JSON.stringify(data, null, 2));
  console.log(`✅ Saved to ${path.basename(LOCAL_FILE)}`);
  console.log(`💡 You can now edit this file and run 'npm run gist-push' to upload changes.`);
}

async function push() {
  if (!GIST_ID || !GH_PAT) throw new Error('Missing GIST_ID or GH_PAT');
  if (!fs.existsSync(LOCAL_FILE)) throw new Error(`${LOCAL_FILE} not found. Run pull first.`);

  console.log(`📤 Pushing ${path.basename(LOCAL_FILE)} to Gist ${GIST_ID}...`);
  const content = fs.readFileSync(LOCAL_FILE, 'utf8');
  
  // Basic JSON validation before pushing
  try {
    JSON.parse(content);
  } catch (e) {
    throw new Error('Invalid JSON in data.local.json. Fix it before pushing.');
  }

  const url = `https://api.github.com/gists/${GIST_ID}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'Authorization': `token ${GH_PAT}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      files: { 'data.json': { content } }
    })
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Push failed');
  }

  console.log(`✅ Gist updated successfully!`);
}

const cmd = process.argv[2];
if (cmd === 'pull') {
  pull().catch(err => console.error(`❌ ${err.message}`));
} else if (cmd === 'push') {
  push().catch(err => console.error(`❌ ${err.message}`));
} else {
  console.log('Usage: node scripts/sync-gist.js [pull|push]');
}
