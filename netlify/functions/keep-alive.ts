import { Handler, schedule } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Main handler function
const handler: Handler = async (event, context) => {
  console.log('Keep-alive function triggered at:', new Date().toISOString());
  
  try {
    // Make a simple query to keep the database active
    // This queries the profiles table and limits to 1 row to minimize load
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (error) {
      console.error('Supabase query error:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          success: false, 
          error: error.message,
          timestamp: new Date().toISOString()
        }),
      };
    }

    console.log('Successfully pinged Supabase database');
    
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true, 
        message: 'Supabase database pinged successfully',
        timestamp: new Date().toISOString(),
        recordsFound: data?.length || 0
      }),
    };
  } catch (error) {
    console.error('Unexpected error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }),
    };
  }
};

// Schedule the function to run every 6 hours (Supabase pauses after 1 week of inactivity)
// Cron format: "0 */6 * * *" = At minute 0 past every 6th hour
export { handler };
export const config = {
  schedule: "0 */6 * * *" // Runs at 00:00, 06:00, 12:00, 18:00 UTC daily
};
