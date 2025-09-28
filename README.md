# BLACKPILL FORUM

A modern web forum application built with React and Vite, designed for self-improvement discussions across multiple specialized categories.

## Features

- User authentication with Supabase
- Multiple forum categories
- Upvote/downvote system
- Anonymous posting
- NSFW content filtering
- Dark mode support
- Real-time updates
- Admin panel
- Responsive design

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- A Supabase account and project

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Fill in your Supabase project URL and anon key

4. Run the database migration in your Supabase SQL editor

5. Start the development server:
   ```bash
   npm run dev
   ```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy!

Or use the Vercel CLI:
```bash
npm i -g vercel
vercel
```

## Environment Variables

- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

## Database Setup

Run the SQL migration file in your Supabase SQL editor to set up all necessary tables and policies.

## License

MIT License