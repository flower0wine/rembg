# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 16 application for AI-powered background removal from images. It features a subscription-based service with free and paid tiers, user authentication via Supabase, and integration with a remote background removal service.

**Key Technologies:**
- **Framework:** Next.js 16 with App Router (React 19)
- **Language:** TypeScript with strict mode enabled
- **Styling:** Tailwind CSS v4
- **State Management:** Jotai (for client-side state), TanStack Query (for server state)
- **Authentication:** Supabase Auth with PKCE flow
- **Database:** Supabase PostgreSQL
- **Storage:** Cloudflare R2 for image storage
- **Payment:** Creem for subscription management
- **Error Tracking:** Sentry
- **Bot Protection:** Cloudflare Turnstile

## Development Commands

```bash
# Development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Type checking
pnpm tsc

# Linting (uses @antfu/eslint-config)
pnpm lint
pnpm lint:fix
```

The project uses pnpm as the package manager with simple-git-hooks and lint-staged configured for pre-commit linting.

## Architecture

### Directory Structure

```
app/                          # Next.js App Router
  ├── (auth)/                 # Authentication route group
  ├── api/                    # API routes
  │   ├── auth/               # Supabase auth callbacks
  │   ├── rembg/              # Background removal endpoint
  │   ├── subscription/       # Subscription management
  │   └── webhook/            # Webhook handlers
  ├── subscription/           # Subscription pages
  ├── history/                # User history page
  └── app/                    # Main app workspace page

components/
  ├── features/               # Feature-specific components
  │   ├── auth/               # Authentication components
  │   ├── checkout/           # Payment/subscription flow
  │   ├── history/            # Processing history
  │   ├── landing/            # Landing page sections
  │   ├── pricing/            # Pricing sections
  │   └── rembg/              # Background removal workspace
  ├── layout/                 # Layout components (Header, Footer)
  ├── providers/              # React context providers
  └── ui/                     # Reusable UI components (Radix-based)

lib/
  ├── constants/              # App constants
  ├── hooks/                  # Custom React hooks
  ├── request/                # HTTP client setup (Axios)
  │   ├── api/                # API service functions
  │   └── axios.ts            # Axios instance with interceptors
  ├── supabase/               # Supabase utilities
  │   ├── client.ts           # Browser client
  │   ├── server.ts           # Server client
  │   ├── admin.ts            # Admin client (service role)
  │   ├── proxy.ts            # Proxy client
  │   ├── database.types.ts   # Generated TypeScript types
  │   ├── subscription.ts     # Subscription logic
  │   └── history.ts          # Processing history
  └── types/                  # TypeScript type definitions
```

### Key Architectural Patterns

**Supabase Client Instances:**
- `lib/supabase/client.ts` - Browser client with PKCE auth flow
- `lib/supabase/server.ts` - Server client for API routes
- `lib/supabase/admin.ts` - Service role client for privileged operations
- `lib/supabase/proxy.ts` - For server-side operations with elevated privileges

**State Management:**
- Jotai atoms for local component state (see `components/features/rembg/store.ts`)
- TanStack Query for server state caching and synchronization
- AuthProvider wraps Supabase auth state for React context

**API Request Flow:**
1. Client makes request through axios instance (`lib/request/axios.ts`)
2. Browser requests proxy to `/api/*` routes
3. API routes use Supabase server client for database operations
4. Responses are typed with `ApiResponse<T>` from `lib/types/http.ts`

**Background Removal Flow:**
The `/api/rembg` route implements a complex workflow:
1. Validates Turnstile token
2. Authenticates user via Supabase
3. Checks subscription status and quota
4. Reserves usage quota atomically (Postgres RPC)
5. Streams upload to R2 (original image)
6. Forwards to remote rembg service
7. Uploads processed image to R2
8. Confirms quota consumption
9. Updates processing history
10. Returns processed image URL with usage stats

**Subscription System:**
- Free plan auto-created on first user interaction
- Usage quota managed via Postgres RPC functions (`reserve_usage_quota`, `confirm_usage_reservation`, `release_usage_reservation`)
- Plan configs stored in `subscription_plans_config` table
- Webhooks from Creem update subscription status

### Environment Variables

Required environment variables (see `.env.example`):

**Supabase:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

**Cloudflare Turnstile:**
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
- `TURNSTILE_SECRET_KEY`

**Background Removal Service:**
- `REMBG_SERVICE_URL` - External service endpoint

**Cloudflare R2 Storage:**
- `R2_TOKEN`, `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`
- `R2_PUBLIC_DOMAIN`
- `CLOUDFLARE_WORKER_AUTH_KEY`

**Creem Payment:**
- `CREEM_API_KEY`
- `NEXT_PUBLIC_CREEM_STARTER_PROJECT_ID`
- `NEXT_PUBLIC_CREEM_PRO_PROJECT_ID`
- `CREEM_WEBHOOK_SECRET`

**Sentry:**
- `NEXT_PUBLIC_SENTRY_DSN`
- `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`

### TypeScript Configuration

- Path alias: `@/*` maps to project root
- Strict mode enabled
- Using next plugin for enhanced Next.js IntelliSense

### Component Patterns

**UI Components:** Based on Radix UI primitives with Tailwind styling. Located in `components/ui/`.

**Feature Components:** Organized by feature domain (auth, checkout, rembg, etc.) in `components/features/`.

**Providers:** Located in `components/providers/` and wrapped at app root in `app/layout.tsx`:
- `ThemeProvider` - Dark/light mode via next-themes
- `QueryProvider` - TanStack Query client
- `AuthProvider` - Supabase auth state
- `FullscreenDropProvider` - Drag-and-drop context

### Database Schema Key Tables

- `user_subscriptions` - User subscription records with quota tracking
- `subscription_plans_config` - Configurable plan settings
- `processing_history` - Image processing records
- `profiles` - User profiles linked to Supabase auth

Postgres RPC functions handle atomic quota operations to prevent race conditions.

### Error Handling

- Sentry integration for error tracking (see `lib/monitoring/sentry.ts`)
- API errors use `ApiError` class from `lib/request/api-error.ts`
- Axios interceptors log request/response in development
- Comprehensive try-catch in `/api/rembg` with proper cleanup