// Environment Configuration
export const config = {
  database: {
    url: process.env.DATABASE_URL || '',
    directUrl: process.env.DIRECT_URL || '',
  },
  email: {
    resendKey: process.env.RESEND_API_KEY || '',
    fromEmail: process.env.FROM_EMAIL || '',
  },
  admin: {
    email: process.env.ADMIN_EMAIL || '',
    password: process.env.ADMIN_PASSWORD || '',
  },
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  },
  nodeEnv: process.env.NODE_ENV || 'development',
};

// Validation function
export function validateConfig() {
  const requiredVars = [
    { key: 'DATABASE_URL', value: config.database.url },
    { key: 'DIRECT_URL', value: config.database.directUrl },
    { key: 'RESEND_API_KEY', value: config.email.resendKey },
    { key: 'FROM_EMAIL', value: config.email.fromEmail },
    { key: 'ADMIN_EMAIL', value: config.admin.email },
    { key: 'ADMIN_PASSWORD', value: config.admin.password },
    { key: 'NEXT_PUBLIC_SUPABASE_URL', value: config.supabase.url },
    { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', value: config.supabase.anonKey },
  ];

  const missingVars = requiredVars.filter(({ value }) => !value);

  if (missingVars.length > 0) {
    console.warn('⚠️  Missing environment variables:', missingVars.map(({ key }) => key));
    if (config.nodeEnv === 'production') {
      throw new Error(`Missing required environment variables: ${missingVars.map(({ key }) => key).join(', ')}`);
    }
  }

  return config;
}

// Don't run validation during build time
// Only validate at runtime in production
