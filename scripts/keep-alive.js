#!/usr/bin/env node

/**
 * Script to manually trigger the Supabase keep-alive function
 * This can be used for testing or manual invocation
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env file if it exists
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: Missing Supabase environment variables');
  console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function keepAlive() {
  console.log('🔄 Pinging Supabase database...');
  console.log('⏰ Timestamp:', new Date().toISOString());
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (error) {
      console.error('❌ Supabase query error:', error.message);
      process.exit(1);
    }

    console.log('✅ Successfully pinged Supabase database');
    console.log(`📊 Records found: ${data?.length || 0}`);
    console.log('🎉 Keep-alive successful!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

keepAlive();
