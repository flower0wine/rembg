-- ------------------
-- subscription_plan 枚举 type
-- ------------------
-- CREATE TYPE subscription_plan AS ENUM ('free', 'starter', 'pro');

-- ------------------
-- user_subscriptions 表
-- ------------------
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan subscription_plan NOT NULL DEFAULT 'free',
  usage_count INTEGER NOT NULL DEFAULT 0,
  max_usage_limit INTEGER NOT NULL,
  max_file_size_kb INTEGER NOT NULL DEFAULT 500,
  max_concurrent INTEGER NOT NULL DEFAULT 1,
  has_priority_support BOOLEAN NOT NULL DEFAULT false,
  has_advanced_analytics BOOLEAN NOT NULL DEFAULT false,
  subscription_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  subscription_end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE (user_id)
);

-- ------------------
-- 索引 (针对常用查询)
-- ------------------
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_plan ON public.user_subscriptions(plan);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_is_active ON public.user_subscriptions(is_active);

-- ==================
-- 自动维护 updated_at 触发器
-- ==================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 先 drop 再建，避免重复错误
DROP TRIGGER IF EXISTS update_user_subscriptions_updated_at ON public.user_subscriptions;

CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ==================
-- 启用 RLS
-- ==================
ALTER TABLE public.user_subscriptions
  ENABLE ROW LEVEL SECURITY;

-- ==================
-- RLS 策略
-- ==================
-- 允许用户查看自己的 subscription
CREATE POLICY "Allow users to view own subscription"
  ON public.user_subscriptions
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IS NOT NULL
    AND auth.uid() = user_id
  );

-- Service role 可以管理所有（插入/更新/删除）
CREATE POLICY "Service role can manage subscriptions"
  ON public.user_subscriptions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ==================
-- 初始化用户订阅函数
-- ==================
CREATE OR REPLACE FUNCTION public.initialize_user_subscription()
RETURNS TRIGGER
AS $$
BEGIN
  INSERT INTO public.user_subscriptions (
    user_id,
    plan,
    usage_count,
    max_usage_limit,
    max_file_size_kb,
    max_concurrent,
    has_priority_support,
    has_advanced_analytics,
    subscription_start_date,
    subscription_end_date,
    is_active
  ) VALUES (
    NEW.id,
    'free',
    0,
    1,     -- free 默认额度
    500,   -- 500 KB
    1,
    false,
    false,
    NOW(),
    NOW() + INTERVAL '30 DAYS', -- 默认 30 天
    true
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------
-- 注册触发器
-- ------------------
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.initialize_user_subscription();

-- ------------------
-- 注释 (可选)
-- ------------------
COMMENT ON TABLE public.user_subscriptions IS 'Stores user subscription plans and usage limits';
COMMENT ON COLUMN public.user_subscriptions.plan IS 'Subscription plan: free, starter, or pro';
COMMENT ON COLUMN public.user_subscriptions.usage_count IS 'Current usage count in the billing period';
COMMENT ON COLUMN public.user_subscriptions.max_usage_limit IS 'Maximum usage limit per billing period';
COMMENT ON COLUMN public.user_subscriptions.max_file_size_kb IS 'Maximum file size in KB';
COMMENT ON COLUMN public.user_subscriptions.max_concurrent IS 'Maximum concurrent uploads allowed';
COMMENT ON COLUMN public.user_subscriptions.subscription_start_date IS 'Subscription start date';
COMMENT ON COLUMN public.user_subscriptions.subscription_end_date IS 'Subscription end date';
COMMENT ON COLUMN public.user_subscriptions.is_active IS 'Whether subscription is currently active';
