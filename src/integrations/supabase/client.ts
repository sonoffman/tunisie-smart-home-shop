// client.ts
// Ne pas mettre la Service Role Key côté front !
// Utiliser uniquement la clé Anon Public Key pour le front (Lovable, navigateur)

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// URL de ton projet Supabase
const SUPABASE_URL = "https://ixurnulffowefnouwfcs.supabase.co";

// Clé publique pour le front
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4dXJudWxmZm93ZWZub3V3ZmNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzNDg2MTQsImV4cCI6MjA2MDkyNDYxNH0.7TJGUB7uo2oQTLFA762YGFKlPwu6-h5t-k6KjJqB8zg";

// Création du client Supabase pour le front
export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);
