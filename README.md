# Time Trials Leaderboard

A modern, responsive leaderboard application for tracking time trial performances. Built with React, Vite, and Tailwind CSS, this app displays runner statistics, personal bests, and edition-based results for running clubs.

## Features

- **Real-time Leaderboard**: View all-time records and edition-specific results.
- **Runner Profiles**: Track individual performances with pace calculations.
- **Admin Panel**: Manage editions, entries, and configurations (requires authentication).
- **SEO Optimized**: Built-in meta tags and social sharing support.
- **Responsive Design**: Works seamlessly on desktop and mobile devices.
- **Data Synchronization**: Syncs data with GitHub Gists for easy deployment.

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Build Tool**: Vite
- **Icons**: Lucide React
- **Data Validation**: Zod
- **Testing**: Vitest
- **Linting**: ESLint with Prettier

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A GitHub account (for data synchronization)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/timetrialswebsite.git
   cd timetrialwebsite
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory:

   ```env
   VITE_ENCRYPTED_PAT=your_encrypted_github_personal_access_token
   ```

   (See Configuration section below for details)

4. For local development, copy to `data.local.json` and modify as needed.

5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
```

### Testing

Run the test suite:

```bash
npm test
```

## Configuration

### Data Sources

The app supports two data modes:

1. **GitHub Gist Mode** (Production):
   - Data is stored and synced with a GitHub Gist.
   - Requires a GitHub Personal Access Token (PAT) with Gist permissions.
   - Encrypt your PAT using the provided script:
     ```bash
     node scripts/encrypt.js
     ```
   - Set `VITE_ENCRYPTED_PAT` in `.env.local`.

2. **Local Mode** (Development):
   - Uses `data.local.json` for local data.
   - Useful for development without GitHub API calls.

### Admin Access

To access the admin panel:

1. Generate an encrypted PAT as above.
2. Visit `/admin` and enter the decryption password (same as encryption password).

### Syncing Data

- Pull latest data: `npm run gist-pull`
- Push changes: `npm run gist-push`

## Project Structure

```
src/
├── api/          # GitHub API integration
├── components/   # Reusable UI components
├── hooks/        # Custom React hooks
├── pages/        # Main page components
├── types/        # TypeScript type definitions
├── utils/        # Utility functions and validation
└── main.tsx      # App entry point
```

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details on:

- Code style and standards
- Submitting pull requests
- Reporting issues
- Development workflow

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you have questions or need help:

- Check the [Contributing Guidelines](CONTRIBUTING.md)
- Open an issue on GitHub
- Contact the maintainers

---

Built with ❤️ for the running community.
