// ─── CONCEPTS IMPLEMENTED IN THIS FILE ─────────────────────────────────────
// • React Profiler → Measures React rendering performance
// ────────────────────────────────────────────────────────────────────────────
//
// React's built-in <Profiler> API lets you measure how long it takes for a
// component tree to render. It fires an onRender callback with timing data
// every time a component inside it commits a render to the DOM.
//
// HOW TO USE:
//   Wrap any component tree you want to measure:
//   <DevProfiler id="JobsGrid">
//     <YourComponent />
//   </DevProfiler>
//
// HOW TO INSPECT:
//   Open DevTools → Console → filter by "🔬 Profiler"
//   You'll see output like:
//   🔬 Profiler [JobsGrid] mount
//      ├─ actualDuration:  4.2ms  ← time THIS render took
//      ├─ baseDuration:   12.1ms  ← estimated full re-render cost
//      └─ startTime:      87.3ms  ← when render started (relative to page load)
//
// NOTE: React Profiler adds slight overhead, so it's disabled in production.
// The <Profiler> component itself is a no-op in production builds.
//
// ALTERNATIVE: Use React DevTools browser extension → Profiler tab for
// a visual flame graph of your component tree renders.

'use client';

import { Profiler, ProfilerOnRenderCallback, ReactNode } from 'react';

interface DevProfilerProps {
  id: string;
  children: ReactNode;
}

// ─── onRender Callback ────────────────────────────────────────────────────
// React calls this each time a component inside <Profiler> renders.
// Parameters:
//   id            — the "id" prop you gave the Profiler
//   phase         — "mount" (first render) | "update" (re-render) | "nested-update"
//   actualDuration — time (ms) this specific render took
//   baseDuration  — estimated time (ms) to render without memoization
//   startTime     — when React started rendering this subtree
//   commitTime    — when React committed (flushed) this render to the DOM
const onRender: ProfilerOnRenderCallback = (
  id,
  phase,
  actualDuration,
  baseDuration,
  startTime,
  commitTime
) => {
  // Only log in development (Profiler is a no-op in production anyway)
  if (process.env.NODE_ENV !== 'development') return;

  // Color-code by phase for easy scanning
  const phaseColor = phase === 'mount' ? '#4ade80' : '#60a5fa';
  const phaseBg    = phase === 'mount' ? '#052e16' : '#0c1a3a';

  console.groupCollapsed(
    `%c🔬 Profiler [${id}] ${phase}`,
    `color: ${phaseColor}; background: ${phaseBg}; padding: 2px 8px; border-radius: 4px; font-weight: bold;`
  );

  // actualDuration: highlight slow renders (>16ms = missed frame)
  const actualColor = actualDuration > 16 ? '#f87171' : '#4ade80';
  console.log(
    `%c├─ actualDuration: ${actualDuration.toFixed(2)}ms`,
    `color: ${actualColor}; font-weight: bold;`
  );
  console.log(`├─ baseDuration:   ${baseDuration.toFixed(2)}ms`);
  console.log(`├─ startTime:      ${startTime.toFixed(2)}ms`);
  console.log(`└─ commitTime:     ${commitTime.toFixed(2)}ms`);
  console.groupEnd();
};

// ─── DevProfiler Component ────────────────────────────────────────────────
// Only wraps with <Profiler> in development. In production, renders children
// directly without any Profiler overhead.
export default function DevProfiler({ id, children }: DevProfilerProps) {
  if (process.env.NODE_ENV !== 'development') {
    return <>{children}</>;
  }

  return (
    // React's built-in Profiler API
    // Concept: React Profiler → Measures React rendering performance
    <Profiler id={id} onRender={onRender}>
      {children}
    </Profiler>
  );
}
