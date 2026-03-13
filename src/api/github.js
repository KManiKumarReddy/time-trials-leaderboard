const GIST_ID = import.meta.env.GIST_ID;
const GITHUB_OWNER = import.meta.env.GITHUB_OWNER;

/**
 * Fetches data from the public Gist raw URL (no auth needed).
 * Since we've moved to Gist-as-backend, this is the primary source of truth.
 */
export async function fetchStats() {
  if (!GIST_ID || !GITHUB_OWNER) {
    throw new Error('GIST_ID or GITHUB_OWNER is not configured. Please check your .env.local or GitHub Actions variables.');
  }

  try {
    // Fetch from public Gist raw URL (no auth, no rate limit)
    // T-param is for cache busting
    const url = `https://gist.githubusercontent.com/${GITHUB_OWNER}/${GIST_ID}/raw/data.json?t=${Date.now()}`;

    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error(`Failed to fetch Gist data: ${res.status} ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    console.error("Could not fetch data:", err);
    throw err;
  }
}

/**
 * Updates the Gist via the GitHub API using the decrypted PAT.
 * This is instant — no rebuild triggered.
 */
export async function updateStats(pat, newData) {
  if (!GIST_ID) {
    throw new Error('GIST_ID is not configured.');
  }

  const url = `https://api.github.com/gists/${GIST_ID}`;

  const payload = {
    files: {
      'data.json': {
        content: JSON.stringify(newData, null, 2)
      }
    }
  };

  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'Authorization': `token ${pat}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errObj = await res.json().catch(() => ({}));
    throw new Error(errObj.message || 'Failed to update Gist');
  }

  return await res.json();
}
