import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cyfjuytxqpjnntnvbblw.supabase.co';
const supabaseKey = 'sb_publishable_foKh65QDiTCPHw-nSRQC8w_9jet7mhf';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage  // Use localStorage so sessions persist across page reloads
  }
});