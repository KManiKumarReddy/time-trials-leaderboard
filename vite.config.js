import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { config as dotenvConfig } from 'dotenv'

// Load .env.local BEFORE config runs (Vite normally loads it after)
dotenvConfig({ path: '.env.local' })

// https://vite.dev/config/
export default defineConfig(() => {
  const repo = process.env.GITHUB_REPOSITORY || '';
  const owner = repo.split('/')[0] || '';
  const repoName = repo.split('/')[1] || '';
  
  // Use repository name for base path if available (for GitHub Pages), else fallback to root
  const basePath = repoName ? `/${repoName}/` : '/';

  return {
    plugins: [
      tailwindcss(),
      react()
    ],
    base: basePath,
    define: {
      'import.meta.env.GITHUB_OWNER': JSON.stringify(owner),
      'import.meta.env.GITHUB_REPO': JSON.stringify(repoName),
      'import.meta.env.GIST_ID': JSON.stringify(process.env.GIST_ID || ''),
    }
  }
})
