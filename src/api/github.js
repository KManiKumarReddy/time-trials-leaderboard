const DATA_PATH = 'public/data.json';

/**
 * Fetches the current stats. First checks for local dev mode fetch,
 * otherwise sets up to use the GitHub REST API logic.
 */
export async function fetchStats() {
  try {
    const res = await fetch('/data.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.json();
  } catch (err) {
    console.error("Could not fetch data:", err);
    return {
      config: {
        club: "Pacers Run Club",
        season: "Season 2",
        distance: "5K",
        githubOwner: "your-username",
        githubRepo: "timetrialswebsite"
      },
      editions: [],
      entries: []
    };
  }
}

/**
 * Updates the remote repository data.json using the GitHub REST API.
 */
export async function updateStats(pat, newData) {
  const { githubOwner, githubRepo } = newData.config;

  if (!githubOwner || !githubRepo) {
    throw new Error('GitHub Owner and Repo must be configured in Global Settings');
  }

  const url = `https://api.github.com/repos/${githubOwner}/${githubRepo}/contents/${DATA_PATH}`;
  
  // 1. Get the current file's SHA (required for updating)
  let sha;
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `token ${pat}`
      }
    });

    if (!res.ok) {
      if (res.status === 404) {
        // File might not exist yet if they haven't committed the skeleton, 
        // we can proceed without a sha.
      } else {
        throw new Error('Failed to fetch file SHA from GitHub');
      }
    } else {
      const fileData = await res.json();
      sha = fileData.sha;
    }
  } catch(e) {
    console.error('Failed fetching file sha:', e);
    throw e;
  }

  // 2. Format new content inside a base64 encoded string
  const fileContent = JSON.stringify(newData, null, 2);
  // We use btoa but handle unicode characters just in case
  const encodedContent = btoa(unescape(encodeURIComponent(fileContent)));

  // 3. Make the PUT request to update the file
  const updatePayload = {
    message: 'Update leaderboards data',
    content: encodedContent,
    sha: sha // Include sha if it exists
  };

  const updateRes = await fetch(url, {
    method: 'PUT',
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'Authorization': `token ${pat}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updatePayload)
  });

  if (!updateRes.ok) {
    const errObj = await updateRes.json().catch(() => ({}));
    throw new Error(errObj.message || 'Failed to push update to GitHub');
  }

  return await updateRes.json();
}
