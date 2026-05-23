import connectDB from '@/lib/db';
import Job from '@/models/Job';
import * as Sentry from '@sentry/nextjs';

// Node.js runtime allows us to query MongoDB directly
export const runtime = 'nodejs';

// Cache generated OG cards for 1 hour
export const revalidate = 3600;

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const job = await Job.findById(params.id);

    // ─── Fallback OG SVG (if job not found) ──────────────────────────────
    if (!job) {
      return new Response(
        `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
          <rect width="100%" height="100%" fill="#1e1b4b" />
          <circle cx="600" cy="315" r="400" fill="#312e81" opacity="0.4" filter="blur(60px)" />
          <text x="600" y="315" fill="white" font-size="60" font-family="system-ui, -apple-system, sans-serif" font-weight="900" text-anchor="middle" dominant-baseline="middle">Recruitment Hub</text>
        </svg>`,
        {
          headers: {
            'Content-Type': 'image/svg+xml',
            'Cache-Control': 'public, max-age=3600',
          },
        }
      );
    }

    const title = job.title;
    const department = job.department;
    const type = job.type || 'Full-time';
    const experience = job.experience || 'Fresher';
    const openings = job.openings || 1;
    const status = job.status || 'Active';

    const expText =
      experience && experience !== 'Fresher'
        ? `${experience} Yrs Exp`
        : 'Entry Level';

    // ─── High-Fidelity SVG OG Card (100% Crash-Proof under Windows) ────────
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
      <!-- Background base -->
      <rect width="100%" height="100%" fill="#0a0a16" />
      
      <!-- Decorative Gradient Glows -->
      <defs>
        <radialGradient id="glow1" cx="10%" cy="10%" r="60%">
          <stop offset="0%" stop-color="#312e81" stop-opacity="0.75" />
          <stop offset="100%" stop-color="#0a0a16" stop-opacity="0" />
        </radialGradient>
        <radialGradient id="glow2" cx="90%" cy="90%" r="60%">
          <stop offset="0%" stop-color="#1e1b4b" stop-opacity="0.9" />
          <stop offset="100%" stop-color="#0a0a16" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#glow1)" />
      <rect width="100%" height="100%" fill="url(#glow2)" />

      <!-- Branded Logo & Header -->
      <g transform="translate(80, 80)">
        <rect width="52" height="52" rx="14" fill="#6366f1" />
        <text x="26" y="34" fill="white" font-size="26" font-family="system-ui, -apple-system, sans-serif" font-weight="900" text-anchor="middle">R</text>
        <text x="72" y="33" fill="white" font-size="22" font-family="system-ui, -apple-system, sans-serif" font-weight="800" letter-spacing="-0.5">Recruitment Hub</text>
      </g>

      <!-- Status Pill -->
      <g transform="translate(940, 80)">
        <rect width="180" height="42" rx="21" fill="#1e293b" stroke="#334155" stroke-width="1.5" />
        <text x="90" y="26" fill="#e2e8f0" font-size="13" font-family="system-ui, -apple-system, sans-serif" font-weight="800" text-anchor="middle" letter-spacing="1" text-transform="uppercase">${status}</text>
      </g>

      <!-- Main Content Block -->
      <g transform="translate(80, 200)">
        <!-- Department tag -->
        <text x="0" y="0" fill="#818cf8" font-size="16" font-family="system-ui, -apple-system, sans-serif" font-weight="700" letter-spacing="2.5" text-transform="uppercase">${department}</text>
        
        <!-- Job Title (auto-wrapping inside foreignObject) -->
        <foreignObject x="0" y="24" width="1040" height="170">
          <div xmlns="http://www.w3.org/1999/xhtml" style="color: white; font-family: system-ui, -apple-system, sans-serif; font-size: 56px; font-weight: 900; line-height: 1.15; letter-spacing: -1px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
            ${title}
          </div>
        </foreignObject>
      </g>

      <!-- Meta pills (Type, Experience, Openings) -->
      <g transform="translate(80, 420)">
        <!-- Pill 1: Type -->
        <g transform="translate(0, 0)">
          <rect width="160" height="46" rx="8" fill="#312e81" opacity="0.5" />
          <text x="80" y="28" fill="#c7d2fe" font-size="15" font-family="system-ui, -apple-system, sans-serif" font-weight="700" text-anchor="middle">${type}</text>
        </g>
        
        <!-- Pill 2: Experience -->
        <g transform="translate(176, 0)">
          <rect width="180" height="46" rx="8" fill="#312e81" opacity="0.5" />
          <text x="90" y="28" fill="#c7d2fe" font-size="15" font-family="system-ui, -apple-system, sans-serif" font-weight="700" text-anchor="middle">${expText}</text>
        </g>

        <!-- Pill 3: Openings -->
        <g transform="translate(372, 0)">
          <rect width="180" height="46" rx="8" fill="#312e81" opacity="0.5" />
          <text x="90" y="28" fill="#c7d2fe" font-size="15" font-family="system-ui, -apple-system, sans-serif" font-weight="700" text-anchor="middle">${openings} Openings</text>
        </g>
      </g>

      <!-- Bottom border divider -->
      <line x1="80" y1="510" x2="1120" y2="510" stroke="#1e293b" stroke-width="2" />

      <!-- Footer branding -->
      <g transform="translate(80, 562)">
        <text x="0" y="0" fill="#475569" font-size="16" font-family="system-ui, -apple-system, sans-serif" font-weight="600">recruitment-hub.app/jobs</text>
        <text x="1040" y="-2" fill="#6366f1" font-size="18" font-family="system-ui, -apple-system, sans-serif" font-weight="800" text-anchor="end">Apply Now</text>
      </g>
    </svg>`;

    return new Response(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error(`API GET /api/jobs/${params.id}/og failed:`, error);
    Sentry.captureException(error);
    return new Response(
      `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
        <rect width="100%" height="100%" fill="#ef4444" />
        <text x="600" y="315" fill="white" font-size="30" font-family="system-ui, sans-serif" text-anchor="middle">Error: ${(error as Error).message}</text>
      </svg>`,
      {
        status: 500,
        headers: {
          'Content-Type': 'image/svg+xml',
        },
      }
    );
  }
}
