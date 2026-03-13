const GIST_ID = import.meta.env.GIST_ID;
const GITHUB_OWNER = import.meta.env.GITHUB_OWNER;

/**
 * Fetches data from the public Gist raw URL (no auth needed).
 * Falls back to the local static data.json for dev mode.
 */
export async function fetchStats() {
  try {
    let url;
    if (GIST_ID && GITHUB_OWNER) {
      // Production: fetch from public Gist raw URL (no auth, no rate limit)
      url = `https://gist.githubusercontent.com/${GITHUB_OWNER}/${GIST_ID}/raw/data.json?t=${Date.now()}`;
    } else {
      // Local dev: fetch from static public/data.json
      url = `${import.meta.env.BASE_URL}data.json`;
    }

    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('Network response was not ok');
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
    throw new Error('GIST_ID is not configured. Ensure it is set as a GitHub Actions variable.');
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
