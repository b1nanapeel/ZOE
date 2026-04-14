import type { NextConfig } from "next";

// CSP — allow Supabase REST + Realtime + Storage; allow inline styles/scripts
// (Next.js requires inline for hydration markers; tighten with nonces later).
const CSP_DIRECTIVES: Record<string, string[]> = {
  "default-src": ["'self'"],
  "script-src": [
    "'self'",
    "'unsafe-inline'",
    "'unsafe-eval'",
    "https://cdn.jsdelivr.net",
  ],
  "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
  "font-src": ["'self'", "data:", "https://fonts.gstatic.com"],
  "img-src": [
    "'self'",
    "data:",
    "blob:",
    "https://*.supabase.co",
    "https://*.supabase.in",
  ],
  "media-src": [
    "'self'",
    "blob:",
    "https://*.supabase.co",
    "https://*.supabase.in",
  ],
  "connect-src": [
    "'self'",
    "https://*.supabase.co",
    "https://*.supabase.in",
    "wss://*.supabase.co",
    "wss://*.supabase.in",
    "https://api.crossref.org",
    "https://cdn.jsdelivr.net",
    "https://storage.googleapis.com",
  ],
  "worker-src": ["'self'", "blob:", "https://cdn.jsdelivr.net"],
  "frame-ancestors": ["'none'"],
  "form-action": ["'self'"],
  "base-uri": ["'self'"],
  "object-src": ["'none'"],
};

const csp = Object.entries(CSP_DIRECTIVES)
  .map(([k, v]) => `${k} ${v.join(" ")}`)
  .join("; ");

const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: SECURITY_HEADERS,
      },
    ];
  },
};

export default nextConfig;
