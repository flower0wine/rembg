-- Create usage_records table for tracking user and guest usage
CREATE TABLE IF NOT EXISTS usage_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  fingerprint TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  CONSTRAINT user_or_fingerprint CHECK (
    (user_id IS NOT NULL) OR (fingerprint IS NOT NULL)
  )
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_usage_records_user_id ON usage_records(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_records_fingerprint ON usage_records(fingerprint);
CREATE INDEX IF NOT EXISTS idx_usage_records_created_at ON usage_records(created_at);

-- Add RLS (Row Level Security) policies
ALTER TABLE usage_records ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own usage records
CREATE POLICY "Users can view own usage records"
  ON usage_records
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Service role can insert usage records
CREATE POLICY "Service role can insert usage records"
  ON usage_records
  FOR INSERT
  WITH CHECK (true);

-- Add comment for documentation
COMMENT ON TABLE usage_records IS 'Tracks usage for both authenticated users and guest users (via browser fingerprint)';
COMMENT ON COLUMN usage_records.user_id IS 'Reference to authenticated user, null for guests';
COMMENT ON COLUMN usage_records.fingerprint IS 'Browser fingerprint for guest users, null for authenticated users';
