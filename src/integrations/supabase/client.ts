import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://ixurnulffowefnouwfcs.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4dXJudWxmZm93ZWZub3V3ZmNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzNDg2MTQsImV4cCI6MjA2MDkyNDYxNH0.7TJGUB7uo2oQTLFA762YGFKlPwu6-h5t-k6KjJqB8zg"; // ta clé Anon

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
