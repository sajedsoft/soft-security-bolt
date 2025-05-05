import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Missing VITE_SUPABASE_URL environment variable');
}

if (!supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable');
}

// Create client with enhanced error handling and retry logic
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: localStorage,
    storageKey: 'supabase.auth.token',
    flowType: 'pkce'
  },
  global: {
    headers: { 
      'x-application-name': 'security-management-system'
    },
    // Improved fetch with better error handling and retry mechanism
    fetch: async (url, options = {}) => {
      const maxRetries = 3;
      let attempt = 0;
      const backoffDelay = 1000; // Start with 1 second delay
      
      while (attempt < maxRetries) {
        try {
          const response = await fetch(url, {
            ...options,
            headers: {
              ...options.headers,
              'Content-Type': 'application/json'
            }
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
          }

          return response;
        } catch (error) {
          attempt++;
          console.error(`Supabase fetch attempt ${attempt} failed:`, error);
          
          if (attempt === maxRetries) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to connect to Supabase after ${maxRetries} attempts: ${errorMessage}`);
          }
          
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, backoffDelay * Math.pow(2, attempt - 1)));
        }
      }

      throw new Error('Failed to connect to Supabase');
    }
  }
});

// Enhanced connection checking with detailed error reporting
export const checkSupabaseConnection = async () => {
  try {
    console.log('Checking Supabase connection...');
    
    // Verify URL format first
    try {
      new URL(supabaseUrl);
    } catch (e) {
      return {
        success: false,
        error: 'Invalid Supabase URL format',
        retryable: false,
        details: 'Please check your VITE_SUPABASE_URL environment variable'
      };
    }
    
    // Test basic connectivity first
    const { error: pingError } = await supabase.from('sites').select('count').limit(1).single();
    if (pingError) {
      console.error('Database ping failed:', pingError);
      
      if (pingError.message.includes('JWT')) {
        await supabase.auth.signOut();
        return {
          success: false,
          error: 'Authentication failed. Please sign in again.',
          retryable: false,
          details: pingError.message
        };
      }

      if (pingError.message.includes('FetchError') || pingError.message.includes('Failed to fetch')) {
        return {
          success: false,
          error: 'Network connection failed. Please check your internet connection and Supabase project status.',
          retryable: true,
          details: pingError.message
        };
      }

      return {
        success: false,
        error: 'Database connection failed.',
        retryable: true,
        details: pingError.message
      };
    }

    // Check session status
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session check failed:', sessionError);
      return {
        success: false,
        error: 'Session validation failed.',
        retryable: false,
        details: sessionError.message
      };
    }

    if (!session) {
      return {
        success: false,
        error: 'No active session found.',
        retryable: false,
        details: 'User is not authenticated'
      };
    }

    // Verify user data
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('User verification failed:', userError);
      await supabase.auth.signOut();
      return {
        success: false,
        error: 'User verification failed. Please sign in again.',
        retryable: false,
        details: userError?.message || 'No user found'
      };
    }

    return { 
      success: true, 
      error: null, 
      retryable: false,
      details: 'Connection successful'
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    console.error('Connection check failed:', err);

    // Handle critical errors
    if (errorMessage.includes('JWT') || errorMessage.includes('token') || errorMessage.includes('auth')) {
      await supabase.auth.signOut();
      return {
        success: false,
        error: 'Authentication error. Please sign in again.',
        retryable: false,
        details: errorMessage
      };
    }

    return {
      success: false,
      error: 'Failed to connect to Supabase.',
      retryable: !errorMessage.includes('unauthorized'),
      details: errorMessage
    };
  }
};