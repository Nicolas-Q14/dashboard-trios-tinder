import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fxkejghceqlzgooeghxk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4a2VqZ2hjZXFsemdvb2VnaHhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3NDMxNjYsImV4cCI6MjA5NTMxOTE2Nn0.6IJrm0eiQ14toqXT_6zhcSwjsxTjucOu8RUJBJ1Pa9I';

export const supabase = createClient(supabaseUrl, supabaseKey);