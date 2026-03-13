import { AppData } from "../types";

const GIST_ID = import.meta.env.VITE_GIST_ID;
const GITHUB_OWNER = import.meta.env.VITE_GITHUB_OWNER;
const GIST_FILENAME = "data.json";

export async function fetchStats(): Promise<AppData> {
  // Use raw URL for better performance and to avoid the complex Gist API for reads
  const response = await fetch(
    `https://gist.githubusercontent.com/${GITHUB_OWNER}/${GIST_ID}/raw/${GIST_FILENAME}?t=${Date.now()}`,
  );

  if (!response.ok) throw new Error("Failed to fetch from Gist raw storage");
  return await response.json();
}

export async function updateStats(
  token: string,
  data: AppData,
): Promise<boolean> {
  const response = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
    method: "PATCH",
    headers: {
      Authorization: `token ${token}`,
      "Content-Type": "application/json",
      Accept: "application/vnd.github.v3+json",
    },
    body: JSON.stringify({
      files: {
        [GIST_FILENAME]: {
          content: JSON.stringify(data, null, 2),
        },
      },
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "Failed to update Gist");
  }

  return true;
}
