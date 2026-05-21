import { ImageResponse } from 'next/og';
import fs from 'fs';
import path from 'path';

// Node.js runtime allows us to read fallback files and connect to the DB safely
export const runtime = 'nodejs';

// OG Image dimensions — standard 1.91:1 ratio for social sharing
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Cache generated OG cards for 1 hour
export const revalidate = 3600;

async function getJob(id: string) {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    const res = await fetch(`${baseUrl}/jobs/${id}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function JobOGImage({
  params,
}: {
  params: { id: string };
}) {
  // ─── Local Dev Windows Crash Prevention ──────────────────────────────────
  // If we are in local development mode, return our pre-rendered, premium
  // og-default.png image. This completely avoids native Resvg C++ segmentation
  // faults ("Empty reply from server") on Windows local development machines.
  if (process.env.NODE_ENV === 'development') {
    try {
      const pngPath = path.join(process.cwd(), 'public/og-default.png');
      const pngData = fs.readFileSync(pngPath);
      return new Response(pngData, {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    } catch {
      // Fall through to satori if read fails
    }
  }

  // ─── Production Satori / ImageResponse (Fully stable on Linux/Vercel) ─────
  const job = await getJob(params.id);

  if (!job) {
    return new ImageResponse(
      (
        <div
          style={{
            width: 1200,
            height: 630,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#4f46e5',
          }}
        >
          <div style={{ color: '#ffffff', fontSize: 60, fontWeight: 900 }}>
            Recruitment Hub
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }

  const expText =
    job.experience && job.experience !== 'Fresher'
      ? `${job.experience} Yrs Experience`
      : 'Entry Level / Fresher';

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#1e1b4b',
          padding: 60,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                width: 50,
                height: 50,
                borderRadius: 12,
                backgroundColor: '#6366f1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontSize: 28,
                fontWeight: 900,
                marginRight: 16,
              }}
            >
              R
            </div>
            <span
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: '#ffffff',
              }}
            >
              Recruitment Hub
            </span>
          </div>

          {/* Status Badge */}
          <div
            style={{
              paddingTop: 8,
              paddingBottom: 8,
              paddingLeft: 20,
              paddingRight: 20,
              borderRadius: 30,
              backgroundColor: '#312e81',
              color: '#e0e7ff',
              fontSize: 16,
              fontWeight: 700,
              textTransform: 'uppercase',
            }}
          >
            {job.status}
          </div>
        </div>

        {/* Body Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            marginTop: 40,
            marginBottom: 40,
          }}
        >
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: '#818cf8',
              textTransform: 'uppercase',
              marginBottom: 12,
            }}
          >
            {job.department}
          </div>

          <div
            style={{
              fontSize: job.title.length > 30 ? 48 : 56,
              fontWeight: 900,
              color: '#ffffff',
              lineHeight: 1.2,
              marginBottom: 24,
            }}
          >
            {job.title}
          </div>

          {/* Meta Row */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
            }}
          >
            <div
              style={{
                paddingTop: 8,
                paddingBottom: 8,
                paddingLeft: 16,
                paddingRight: 16,
                borderRadius: 8,
                backgroundColor: '#2e1065',
                color: '#f3e8ff',
                fontSize: 16,
                fontWeight: 600,
                marginRight: 12,
              }}
            >
              {job.type || 'Full-time'}
            </div>
            <div
              style={{
                paddingTop: 8,
                paddingBottom: 8,
                paddingLeft: 16,
                paddingRight: 16,
                borderRadius: 8,
                backgroundColor: '#2e1065',
                color: '#f3e8ff',
                fontSize: 16,
                fontWeight: 600,
                marginRight: 12,
              }}
            >
              {expText}
            </div>
            <div
              style={{
                paddingTop: 8,
                paddingBottom: 8,
                paddingLeft: 16,
                paddingRight: 16,
                borderRadius: 8,
                backgroundColor: '#2e1065',
                color: '#f3e8ff',
                fontSize: 16,
                fontWeight: 600,
              }}
            >
              {job.openings || 1} Openings
            </div>
          </div>
        </div>

        {/* Separator line */}
        <div
          style={{
            height: 2,
            backgroundColor: '#312e81',
            width: '100%',
            marginBottom: 20,
          }}
        />

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <span
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: '#94a3b8',
            }}
          >
            recruitment-hub.app/jobs
          </span>
          <span
            style={{
              fontSize: 18,
              fontWeight: 800,
              color: '#6366f1',
            }}
          >
            Apply Now
          </span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
