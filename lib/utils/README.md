# Usage Limiting and Fingerprinting

This document explains how to use the browser fingerprinting and usage limiting functionality.

## Browser Fingerprinting

The fingerprinting utility uses FingerprintJS to generate unique identifiers for guest users.

### Usage

```typescript
import { generateFingerprint, getSessionFingerprint } from "@/lib/utils/fingerprint";

// Generate a new fingerprint
const fingerprint = await generateFingerprint();

// Get or create a session fingerprint (cached in sessionStorage)
const sessionFingerprint = await getSessionFingerprint();
```

### Features

- **Singleton pattern**: FingerprintJS agent is initialized once and reused
- **Session caching**: Fingerprints are cached in sessionStorage to reduce computation
- **Fallback mechanism**: If fingerprinting fails (e.g., blocked by browser), a random ID is generated

## Usage Limiting

The usage limiter tracks and limits guest user processing requests based on their browser fingerprint.

### Configuration

- **Guest users**: 1 free processing request per fingerprint
- **Authenticated users**: Unlimited processing

### API Functions

#### `checkUsageLimit(fingerprint, userId?)`

Check if a user can process an image.

```typescript
import { checkUsageLimit } from "@/lib/utils/usage-limiter";

const result = await checkUsageLimit(fingerprint, userId);

if (result.canProcess) {
  // Allow processing
  console.log(`Remaining: ${result.remainingCount}`);
}
else {
  // Show login prompt
  console.log(result.message); // "Free limit reached. Please login to continue."
}
```

**Returns:**

```typescript
{
  canProcess: boolean;        // Whether processing is allowed
  remainingCount: number;     // Remaining free requests (-1 for unlimited)
  requiresLogin: boolean;     // Whether user needs to login
  message?: string;           // User-friendly message
}
```

#### `recordUsage(fingerprint, userId?)`

Record a usage event after successful processing.

```typescript
import { recordUsage } from "@/lib/utils/usage-limiter";

const success = await recordUsage(fingerprint, userId);
```

#### `getUsageCount(fingerprint, userId?)`

Get the current usage count for a user or fingerprint.

```typescript
import { getUsageCount } from "@/lib/utils/usage-limiter";

const count = await getUsageCount(fingerprint, userId);
console.log(`Used ${count} times`);
```

## API Route Example

The `/api/check-usage` endpoint demonstrates how to use these utilities:

```typescript
// POST /api/check-usage
// Body: { fingerprint: string }

const response = await fetch("/api/check-usage", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ fingerprint }),
});

const result = await response.json();
// result: UsageLimitResult
```

## Integration Example

Here's how to integrate usage limiting in a background removal API route:

```typescript
import { createClient } from "@/lib/supabase/server";
import { checkUsageLimit, recordUsage } from "@/lib/utils/usage-limiter";

export async function POST(request: Request) {
  const { fingerprint, image } = await request.json();

  // Get current user
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Check usage limit
  const limitCheck = await checkUsageLimit(fingerprint, user?.id);

  if (!limitCheck.canProcess) {
    return NextResponse.json(
      { error: limitCheck.message },
      { status: 403 }
    );
  }

  // Process image...
  const processedImage = await processImage(image);

  // Record usage
  await recordUsage(fingerprint, user?.id);

  return NextResponse.json({ processedImage });
}
```

## Database Schema

The usage tracking uses the `usage_records` table:

```sql
CREATE TABLE usage_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  fingerprint TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT user_or_fingerprint CHECK (
    (user_id IS NOT NULL) OR (fingerprint IS NOT NULL)
  )
);
```

- For authenticated users: `user_id` is set, `fingerprint` is null
- For guest users: `fingerprint` is set, `user_id` is null
