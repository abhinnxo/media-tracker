
// Environment variable validation and configuration
interface EnvironmentConfig {
  supabase: {
    url: string;
    anonKey: string;
  };
  tmdb: {
    apiKey: string;
    baseUrl: string;
    imageBaseUrl: string;
  };
  app: {
    name: string;
    version: string;
  };
  storage: {
    bucketName: string;
    maxFileSize: number;
  };
}

// Validate required environment variables
const validateEnvVar = (key: string, value: string | undefined): string => {
  if (!value || value.trim() === '') {
    console.warn(`Environment variable ${key} is not set. Using fallback values.`);
    return '';
  }
  return value;
};

// Environment configuration with fallbacks to existing hardcoded values
export const env: EnvironmentConfig = {
  supabase: {
    url: validateEnvVar('VITE_SUPABASE_URL', import.meta.env.VITE_SUPABASE_URL) || 
         'https://axszgtxesmgveakubicg.supabase.co',
    anonKey: validateEnvVar('VITE_SUPABASE_ANON_KEY', import.meta.env.VITE_SUPABASE_ANON_KEY) || 
             'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4c3pndHhlc21ndmVha3ViaWNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3MTg0MTYsImV4cCI6MjA1ODI5NDQxNn0.utoFNJm4WD3A0_SOfzY7qAif4QR0OySoquRLg2Pgk8k'
  },
  tmdb: {
    apiKey: validateEnvVar('VITE_TMDB_API_KEY', import.meta.env.VITE_TMDB_API_KEY) || '',
    baseUrl: import.meta.env.VITE_TMDB_BASE_URL || 'https://api.themoviedb.org/3',
    imageBaseUrl: import.meta.env.VITE_TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p/'
  },
  app: {
    name: import.meta.env.VITE_APP_NAME || 'Media Tracker',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0'
  },
  storage: {
    bucketName: import.meta.env.VITE_STORAGE_BUCKET_NAME || 'media-images',
    maxFileSize: parseInt(import.meta.env.VITE_MAX_FILE_SIZE || '5242880', 10)
  }
};

// Validation function to check if all required environment variables are set
export const validateEnvironment = (): { isValid: boolean; missingVars: string[] } => {
  const missingVars: string[] = [];

  if (!env.supabase.url) missingVars.push('VITE_SUPABASE_URL');
  if (!env.supabase.anonKey) missingVars.push('VITE_SUPABASE_ANON_KEY');

  return {
    isValid: missingVars.length === 0,
    missingVars
  };
};

// Initialize environment validation on app startup
export const initializeEnvironment = (): void => {
  const { isValid, missingVars } = validateEnvironment();
  
  if (!isValid) {
    console.warn('Missing environment variables:', missingVars);
    console.warn('Some features may not work properly. Please check your .env file.');
  }
  
  console.log('Environment initialized:', env.app.name, 'v' + env.app.version);
};
