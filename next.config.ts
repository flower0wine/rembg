import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const isProduction = process.env.NODE_ENV === "production";

const connectSrc = [
  "https://image.flowerwine.dpdns.org",
  "https://*.supabase.co",
  "https://www.google.com",
  "https://www.gstatic.com",
  "https://static.cloudflareinsights.com",
  "https://cloudflareinsights.com",
  !isProduction && "ws://127.0.0.1:*",
  !isProduction && "ws://localhost:*",
];

const scriptSrc = [
  "https://www.google.com",
  "https://www.gstatic.com",
  "https://challenges.cloudflare.com",
  "https://static.cloudflareinsights.com",
];

const cspHeader = `
    default-src 'self';
    connect-src 'self' ${connectSrc.join(" ")};
    script-src 'self' 'unsafe-eval' 'unsafe-inline' ${scriptSrc.join(" ")};
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https: https://image.flowerwine.dpdns.org;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    frame-src https://www.google.com https://challenges.cloudflare.com;
    upgrade-insecure-requests;`;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: cspHeader.replace(/\n/g, ""),
          },
        ],
      },
    ];
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production"
      ? {
          exclude: ["error", "warning"]
        }
      : false
  },
};

// Sentry configuration options
// Note: Some webpack-specific features won't work with Turbopack in dev mode,
// but error capturing and basic functionality will still work.
const sentryOptions = {
  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/

  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Pass the auth token
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Hides source maps from generated client bundles
  hideSourceMaps: true,

  // Disable debug logging to reduce bundle size
  bundleSizeOptimizations: {
    excludeDebugStatements: true,
    excludeReplayIframe: true,
    excludeReplayShadowDom: true,
  },

  // Tunneling can help with ad blockers
  tunnelRoute: "/monitoring",
};

export default withSentryConfig(nextConfig, sentryOptions);