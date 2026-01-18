import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployment
  output: 'standalone',

  // Disable telemetry
  telemetry: false,

  // Environment variables that should be available to the browser
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_FEATURE_NEXUS_ENABLED: process.env.NEXT_PUBLIC_FEATURE_NEXUS_ENABLED,
    NEXT_PUBLIC_FEATURE_COMPLIANCE_ENABLED: process.env.NEXT_PUBLIC_FEATURE_COMPLIANCE_ENABLED,
    NEXT_PUBLIC_FEATURE_FINANCIAL_ENABLED: process.env.NEXT_PUBLIC_FEATURE_FINANCIAL_ENABLED,
    NEXT_PUBLIC_FEATURE_CRM_ENABLED: process.env.NEXT_PUBLIC_FEATURE_CRM_ENABLED,
    NEXT_PUBLIC_FEATURE_CALENDAR_ENABLED: process.env.NEXT_PUBLIC_FEATURE_CALENDAR_ENABLED,
    NEXT_PUBLIC_FEATURE_PULSE_ENABLED: process.env.NEXT_PUBLIC_FEATURE_PULSE_ENABLED,
    // Firebase configuration
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    NEXT_PUBLIC_FIREBASE_DATABASE_URL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    // Lovable API
    NEXT_PUBLIC_LOVABLE_API_URL: process.env.NEXT_PUBLIC_LOVABLE_API_URL,
    NEXT_PUBLIC_LOVABLE_PROJECT_ID: process.env.NEXT_PUBLIC_LOVABLE_PROJECT_ID,
  },

  // Experimental features
  experimental: {
    // Enable the app directory
    appDir: true,
  },

  // Image optimization settings
  images: {
    domains: ['localhost'],
    unoptimized: process.env.NODE_ENV === 'development',
  },

  // Headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
