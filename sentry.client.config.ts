import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "https://dummy-dsn@sentry.io/123456",
  tracesSampleRate: 1.0,
  debug: false,
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  
  // Rectify local development HMR/Fast Refresh transient noise
  ignoreErrors: [
    "Cannot read properties of null (reading 'useContext')",
    "reading 'useContext'",
    "Hydration failed",
    "Failed to execute 'removeChild' on 'Node'",
    "Failed to execute 'insertBefore' on 'Node'"
  ],
});
