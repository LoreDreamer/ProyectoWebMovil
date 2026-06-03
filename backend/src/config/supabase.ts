import { createClient } from '@supabase/supabase-js';
import nodeFetch from 'node-fetch';

import { env } from './env';

export const supabase = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
  auth: {
    persistSession: false
  },
  global: {
    fetch: nodeFetch as any
  }
});
