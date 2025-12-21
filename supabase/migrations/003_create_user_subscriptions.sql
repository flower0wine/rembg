-- Create subscription_plans enum
CREATE TYPE subscription_plan AS ENUM ('free', 'pro', 'enterprise');

-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan subscription_plan NOT NULL DEFAULT 'free',
  billing_period TEXT CHECK (billing_period IN ('monthly', 'annual')) NOT NULL,
  usage_count INTEGER NOT NULL DEFAULT 0,
  max_usage_limit INTEGER NOT NULL,
  max_file_size_mb INTEGER NOT NULL DEFAULT 10,
  max_batch_size INTEGER NOT NULL DEFAULT 1,
  has_api_access BOOLEAN NOT NULL DEFAULT false,
  has_priority_support BOOLEAN NOT NULL DEFAULT false,
  subscription_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  subscription_end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_plan ON user_subscriptions(plan);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_is_active ON user_subscriptions(is_active);

-- Add RLS policies
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own subscription
CREATE POLICY "Users can view own subscription"
  ON user_subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Service role can manage subscriptions
CREATE POLICY "Service role can manage subscriptions"
  ON user_subscriptions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to initialize free subscription for new users
CREATE OR REPLACE FUNCTION initialize_user_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_subscriptions (
    user_id,
    plan,
    usage_count,
    max_usage_limit,
    max_file_size_mb,
    max_batch_size,
    has_api_access,
    has_priority_support
  ) VALUES (
    NEW.id,
    'free',
    0,
    3, -- Free users get 3 uses
    10, -- 10MB max file size
    1, -- No batch processing
    false,
    false
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create subscription when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION initialize_user_subscription();

-- Add comments
COMMENT ON TABLE user_subscriptions IS 'Stores user subscription plans and usage limits';
COMMENT ON COLUMN user_subscriptions.plan IS 'Subscription plan: free, pro, or enterprise';
COMMENT ON COLUMN user_subscriptions.usage_count IS 'Current usage count in the billing period';
COMMENT ON COLUMN user_subscriptions.max_usage_limit IS 'Maximum usage limit (NULL for unlimited)';
COMMENT ON COLUMN user_subscriptions.max_file_size_mb IS 'Maximum file size in MB';
COMMENT ON COLUMN user_subscriptions.max_batch_size IS 'Maximum batch processing size';
