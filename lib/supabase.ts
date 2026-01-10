import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jvokmvqqftrsymxxmbnc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2b2ttdnFxZnRyc3lteHhtYm5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwNDM3NjAsImV4cCI6MjA4MzYxOTc2MH0.lQzUbET4GzHUKqc3J6JarqRWhTxvT3Jr--Pvf_ylSbs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
