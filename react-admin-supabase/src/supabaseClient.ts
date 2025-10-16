import { createClient } from '@supabase/supabase-js';

// Supabase configuration for admin-only app
const supabaseUrl = 'https://vzwqiyxjzmbnlvxhopye.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6d3FpeXhqem1ibmx2eGhvcHllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4NTMzMTYsImV4cCI6MjA3MTQyOTMxNn0.UX6wLAsMYUZQyqRyFayc1FK2uesd9887oKt4bW4uebg';

console.log('🔗 [SUPABASE] Initializing Supabase client', {
  url: supabaseUrl,
  hasKey: !!supabaseAnonKey,
  keyLength: supabaseAnonKey?.length
});

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});

console.log('✅ [SUPABASE] Client created successfully');


