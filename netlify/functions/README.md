# Supabase Keep-Alive Function

This Netlify serverless function prevents your Supabase project from auto-pausing due to inactivity.

## How It Works

- **Scheduled Execution**: Runs automatically every 6 hours (00:00, 06:00, 12:00, 18:00 UTC)
- **Database Ping**: Makes a simple query to the `users` table to keep the database active
- **Serverless**: Runs as a Netlify Function with zero infrastructure management

## Configuration

The function is configured in `netlify.toml`:

```toml
[functions]
  node_bundler = "esbuild"

[[functions."keep-alive"]]
  schedule = "0 */6 * * *"
```

## Environment Variables Required

Make sure these environment variables are set in your Netlify dashboard:

- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous/public key

## Testing Locally

To test the function locally with Netlify CLI:

```bash
# Install Netlify CLI if you haven't already
npm install -g netlify-cli

# Run the function locally
netlify functions:invoke keep-alive
```

## Manual Trigger

You can also trigger the function manually via URL after deployment:

```
https://your-site.netlify.app/.netlify/functions/keep-alive
```

## Monitoring

Check your Netlify Function logs to see execution history:
1. Go to your Netlify dashboard
2. Navigate to Functions tab
3. Click on `keep-alive` to view logs

## Response Format

Successful response:
```json
{
  "success": true,
  "message": "Supabase database pinged successfully",
  "timestamp": "2026-01-11T12:00:00.000Z",
  "recordsFound": 1
}
```

Error response:
```json
{
  "success": false,
  "error": "Error message",
  "timestamp": "2026-01-11T12:00:00.000Z"
}
```
