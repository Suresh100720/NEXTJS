// ─── CONCEPTS IMPLEMENTED IN THIS FILE ─────────────────────────────────────
// • Core Web Vitals → Google performance/user experience metrics
// • LCP  → Largest Contentful Paint — measures main content loading speed
// • INP  → Interaction to Next Paint — measures interaction responsiveness
// • CLS  → Cumulative Layout Shift — measures layout stability during loading
// • Lighthouse → Website performance and SEO auditing tool
// ────────────────────────────────────────────────────────────────────────────
//
// useReportWebVitals is a Next.js hook that fires a callback each time the
// browser calculates a Core Web Vital metric. It taps into the web-vitals
// library that Next.js bundles internally.
//
// In production you would send these metrics to an analytics endpoint
// (e.g. Google Analytics, Vercel Analytics, or your own DB).
// Here we log them to the console in development so you can see them live.
//
// HOW TO INSPECT:
//   1. Open the app in the browser
//   2. Open DevTools → Console
//   3. Interact with the page (scroll, click, navigate)
//   4. You'll see metric objects like:
//      { name: 'LCP', value: 1234, rating: 'good', navigationType: 'navigate' }
//
// GOOD THRESHOLDS (Google recommendations):
//   LCP  < 2.5s   → Good   |  2.5–4s → Needs Improvement  |  >4s → Poor
//   INP  < 200ms  → Good   |  200–500ms → Needs Improvement|  >500ms → Poor
//   CLS  < 0.1    → Good   |  0.1–0.25 → Needs Improvement |  >0.25 → Poor
//   TTFB < 800ms  → Good
//   FCP  < 1.8s   → Good

'use client';

import { useEffect } from 'react';
import { useReportWebVitals } from 'next/web-vitals';

const METRIC_COLORS: Record<string, string> = {
  LCP:  '#4ade80', // green — Largest Contentful Paint
  INP:  '#60a5fa', // blue  — Interaction to Next Paint
  CLS:  '#f59e0b', // amber — Cumulative Layout Shift
  TTFB: '#a78bfa', // purple — Time to First Byte
  FCP:  '#fb923c', // orange — First Contentful Paint
};

const METRIC_DESCRIPTIONS: Record<string, string> = {
  LCP:  'Largest Contentful Paint — main content load speed',
  INP:  'Interaction to Next Paint — interaction responsiveness',
  CLS:  'Cumulative Layout Shift — visual stability',
  TTFB: 'Time to First Byte — server response speed',
  FCP:  'First Contentful Paint — first visible content',
};

export default function WebVitals() {
  // ─── Real-time INP PerformanceObserver ──────────────────────────────────────
  // INP standardly logs only when the page state changes to hidden or unloads.
  // In development, we use a PerformanceObserver on event-timing entries
  // to calculate and print interaction durations (INP) in real-time.
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

    let maxDuration = 0;

    try {
      const observer = new PerformanceObserver((list) => {
        let updated = false;
        
        for (const entry of list.getEntries()) {
          const eventEntry = entry as any;
          // interactionId links related events (e.g. pointerdown, pointerup, click)
          // duration is the actual time elapsed before the browser can paint
          if (eventEntry.interactionId && eventEntry.duration > maxDuration) {
            maxDuration = eventEntry.duration;
            updated = true;
          }
        }

        if (updated) {
          const color = METRIC_COLORS['INP'] || '#60a5fa';
          const rating =
            maxDuration < 200 ? 'good' :
            maxDuration < 500 ? 'needs-improvement' : 'poor';
          const ratingEmoji =
            rating === 'good' ? '✅' :
            rating === 'needs-improvement' ? '⚠️' : '❌';

          console.group(
            `%c⚡ Web Vital: INP (Real-time)`,
            `color: ${color}; font-weight: bold; font-size: 13px;`
          );
          console.log(`📊 Metric:  Interaction to Next Paint — interaction responsiveness`);
          console.log(`📈 Value:   ${Math.round(maxDuration)}ms`);
          console.log(`🏷  Rating:  ${ratingEmoji} ${rating}`);
          console.log(`💡 Status:  Active real-time interaction update`);
          console.groupEnd();
        }
      });

      // durationThreshold: 16 is the minimum allowed to capture all meaningful interactions
      observer.observe({ type: 'event', buffered: true, durationThreshold: 16 } as any);

      return () => {
        observer.disconnect();
      };
    } catch (e) {
      // Event timing PerformanceObserver is not supported in this browser
      console.warn('Real-time INP PerformanceObserver not supported:', e);
    }
  }, []);

  // ─── useReportWebVitals ────────────────────────────────────────────────────
  // This hook fires once per metric per page load.
  // 'metric' object shape:
  //   { id, name, value, rating, delta, navigationType, entries }
  useReportWebVitals((metric) => {
    // Only log in development — in production, send to analytics
    if (process.env.NODE_ENV !== 'development') {
      // Production: send to your analytics service
      // Example: sendToAnalytics(metric);
      return;
    }

    const color = METRIC_COLORS[metric.name] || '#94a3b8';
    const desc  = METRIC_DESCRIPTIONS[metric.name] || metric.name;

    // Format the value nicely
    // CLS is a unitless ratio; others are in milliseconds
    const formattedValue =
      metric.name === 'CLS'
        ? metric.value.toFixed(4)
        : `${Math.round(metric.value)}ms`;

    // Rating is 'good', 'needs-improvement', or 'poor'
    const ratingEmoji =
      metric.rating === 'good' ? '✅' :
      metric.rating === 'needs-improvement' ? '⚠️' : '❌';

    console.group(
      `%c⚡ Web Vital: ${metric.name}`,
      `color: ${color}; font-weight: bold; font-size: 13px;`
    );
    console.log(`📊 Metric:  ${desc}`);
    console.log(`📈 Value:   ${formattedValue}`);
    console.log(`🏷  Rating:  ${ratingEmoji} ${metric.rating}`);
    console.log(`🆔 ID:      ${metric.id}`);
    console.groupEnd();
  });

  // This component renders nothing — it's purely a side-effect hook
  return null;
}
