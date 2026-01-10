# VHL Abroad Career Portal - Deployment Guide

## Environment Variables

Before deploying, set up the following environment variables in your Netlify dashboard:

1. Go to Site settings → Environment variables
2. Add the following variables:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

## Deployment Steps

### Deploy to Netlify

1. Push your code to GitHub (already done ✓)
2. Go to [Netlify](https://app.netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Connect to GitHub and select the `VHL-Abroad` repository
5. Configure build settings (already set in netlify.toml):
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Add environment variables in Netlify dashboard
7. Click "Deploy site"

### Local Development

1. Copy `.env.example` to `.env`
2. Fill in your actual Supabase credentials
3. Run `npm install`
4. Run `npm run dev`

## Security Notes

- The `.env` file is gitignored and contains your actual API keys
- Never commit `.env` to version control
- Use `.env.example` as a template for other developers
- Set environment variables in Netlify dashboard for production
