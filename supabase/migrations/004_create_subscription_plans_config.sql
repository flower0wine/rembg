-- ------------------
-- Enum 类型 subscription_plan 必须先创建
CREATE TYPE subscription_plan AS ENUM ('free', 'starter', 'pro');

-- ------------------
-- subscription_plans_config 表
-- ------------------
CREATE TABLE IF NOT EXISTS public.subscription_plans_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan subscription_plan NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  
  -- Usage limits
  max_usage_limit INTEGER NOT NULL,
  max_file_size_kb INTEGER NOT NULL,
  max_concurrent INTEGER NOT NULL,
  
  -- Features
  has_priority_support BOOLEAN NOT NULL DEFAULT false,
  has_advanced_analytics BOOLEAN NOT NULL DEFAULT false,
  
  -- Pricing
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

-- 索引（提高 WHERE 过滤性能）
CREATE INDEX IF NOT EXISTS idx_subscription_plans_config_plan ON public.subscription_plans_config(plan);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_config_visible ON public.subscription_plans_config(is_visible);

-- ==================
-- updated_at 自动更新触发器
-- ==================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 删除旧的同名触发器（避免重复）
DROP TRIGGER IF EXISTS update_subscription_plans_config_updated_at ON public.subscription_plans_config;

CREATE TRIGGER update_subscription_plans_config_updated_at
  BEFORE UPDATE ON public.subscription_plans_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ==================
-- 启用 RLS（必须），否则该表对 anon/客户机暴露过度或不可访问
-- ==================
ALTER TABLE public.subscription_plans_config
  ENABLE ROW LEVEL SECURITY;

-- ==================
-- RLS 策略
-- ==================
-- 1) 允许任意人查看可见的 plan（前端定价页可访问）
CREATE POLICY "Anyone can view visible plans"
  ON public.subscription_plans_config
  FOR SELECT
  TO anon, authenticated
  USING (is_visible = true);

-- 2) 服务端角色可完全管理该表（包括所有 CRUD）
CREATE POLICY "Service role can manage plans"
  ON public.subscription_plans_config
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 注释（保留原有字段注释）
COMMENT ON TABLE public.subscription_plans_config IS 'Centralized subscription plans configuration - single source of truth for pricing';
COMMENT ON COLUMN public.subscription_plans_config.features_json IS 'Array of feature descriptions for display on pricing page';
COMMENT ON COLUMN public.subscription_plans_config.metadata IS 'Additional flexible metadata for future extensions';
