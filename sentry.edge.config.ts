import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN || "https://dummy-dsn@sentry.io/123456",
  tracesSampleRate: 1.0,
  debug: false,
});
