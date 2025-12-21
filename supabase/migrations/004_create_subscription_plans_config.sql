-- Create subscription_plans_config table to centralize pricing configuration
CREATE TABLE IF NOT EXISTS subscription_plans_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan subscription_plan NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  
  -- Usage limits
  max_usage_limit INTEGER NOT NULL,
  max_file_size_mb INTEGER NOT NULL,
  max_batch_size INTEGER NOT NULL,
  
  -- Features
  has_api_access BOOLEAN NOT NULL DEFAULT false,
  has_priority_support BOOLEAN NOT NULL DEFAULT false,
  has_advanced_analytics BOOLEAN NOT NULL DEFAULT false,
  has_custom_branding BOOLEAN NOT NULL DEFAULT false,
  
  -- Pricing
  monthly_price_cents INTEGER NOT NULL DEFAULT 0,
  annual_price_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  
  -- Display order and visibility
  display_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  
  -- Metadata
  features_json JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Insert default plans
INSERT INTO subscription_plans_config (
  plan, display_name, description,
  max_usage_limit, max_file_size_mb, max_batch_size,
  has_api_access, has_priority_support, has_advanced_analytics, has_custom_branding,
  monthly_price_cents, annual_price_cents,
  display_order, is_visible, is_featured,
  features_json
) VALUES 
(
  'free',
  'Free',
  'Perfect for trying out our service',
  3, 10, 1,
  false, false, false, false,
  0, 0,
  1, true, false,
  '[
    "3 uses per month",
    "10MB max file size",
    "Basic support",
    "Community access"
  ]'::jsonb
),
(
  'pro',
  'Pro',
  'For professionals and small teams',
  500, 25, 50,
  false, true, true, false,
  1999, 19990,
  2, true, true,
  '[
    "500 uses per month",
    "25MB max file size",
    "Batch processing (50 files)",
    "Priority support",
    "Advanced analytics",
    "Email support"
  ]'::jsonb
),
(
  'enterprise',
  'Enterprise',
  'For large organizations with custom needs',
  99999, 999999, 999999,
  true, true, true, true,
  9999, 99990,
  3, true, false,
  '[
    "Unlimited uses",
    "Unlimited file size",
    "Unlimited batch processing",
    "API access",
    "Priority support",
    "Advanced analytics",
    "Custom branding",
    "Dedicated account manager",
    "SLA guarantee"
  ]'::jsonb
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_subscription_plans_config_plan ON subscription_plans_config(plan);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_config_visible ON subscription_plans_config(is_visible);

-- Add RLS policies
ALTER TABLE subscription_plans_config ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view visible plans (for pricing page)
CREATE POLICY "Anyone can view visible plans"
  ON subscription_plans_config
  FOR SELECT
  USING (is_visible = true);

-- Policy: Service role can manage plans
CREATE POLICY "Service role can manage plans"
  ON subscription_plans_config
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Trigger to auto-update updated_at
CREATE TRIGGER update_subscription_plans_config_updated_at
  BEFORE UPDATE ON subscription_plans_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE subscription_plans_config IS 'Centralized subscription plans configuration - single source of truth for pricing';
COMMENT ON COLUMN subscription_plans_config.features_json IS 'Array of feature descriptions for display on pricing page';
COMMENT ON COLUMN subscription_plans_config.metadata IS 'Additional flexible metadata for future extensions';
