-- ===============================
-- usage_reservations 使用额度预留表
-- ===============================
CREATE TABLE IF NOT EXISTS public.usage_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'released')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  released_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  metadata JSONB
);

-- ===============================
-- 索引（性能 & 清理任务优化）
-- ===============================
CREATE INDEX IF NOT EXISTS idx_usage_reservations_user_id
  ON public.usage_reservations(user_id);

CREATE INDEX IF NOT EXISTS idx_usage_reservations_status
  ON public.usage_reservations(status);

CREATE INDEX IF NOT EXISTS idx_usage_reservations_expires_at
  ON public.usage_reservations(expires_at);

-- ===============================
-- 函数 1: 预留额度（原子性）
-- ===============================
CREATE OR REPLACE FUNCTION public.reserve_usage_quota(
  p_user_id UUID,
  p_timeout_seconds INTEGER DEFAULT 300
)
RETURNS TABLE (
  reservation_id UUID,
  current_usage INTEGER,
  max_limit INTEGER,
  plan subscription_plan
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_count INTEGER;
  v_pending_count INTEGER;
  v_max_limit INTEGER;
  v_plan subscription_plan;
  v_is_active BOOLEAN;
  v_reservation_id UUID;
BEGIN
  SELECT
    us.usage_count,
    us.max_usage_limit,
    us.plan,
    us.is_active
  INTO
    v_current_count,
    v_max_limit,
    v_plan,
    v_is_active
  FROM public.user_subscriptions us
  WHERE us.user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'subscription_not_found';
  END IF;

  IF NOT v_is_active THEN
    RAISE EXCEPTION 'subscription_inactive';
  END IF;

  SELECT COUNT(*)
  INTO v_pending_count
  FROM public.usage_reservations
  WHERE user_id = p_user_id
    AND status = 'pending'
    AND expires_at > NOW();

  IF (v_current_count + v_pending_count) >= v_max_limit THEN
    RAISE EXCEPTION 'quota_exceeded';
  END IF;

  INSERT INTO public.usage_reservations (
    user_id,
    status,
    expires_at
  ) VALUES (
    p_user_id,
    'pending',
    NOW() + (p_timeout_seconds || ' seconds')::INTERVAL
  )
  RETURNING id INTO v_reservation_id;

  RETURN QUERY
  SELECT
    v_reservation_id,
    v_current_count,
    v_max_limit,
    v_plan;
END;
$$;

-- ===============================
-- 函数 2: 确认使用
-- ===============================
CREATE OR REPLACE FUNCTION public.confirm_usage_reservation(
  p_reservation_id UUID,
  p_user_id UUID
)
RETURNS TABLE (
  success BOOLEAN,
  new_usage_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_reservation_status TEXT;
  v_new_count INTEGER;
BEGIN
  SELECT status
  INTO v_reservation_status
  FROM public.usage_reservations
  WHERE id = p_reservation_id
    AND user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'reservation_not_found';
  END IF;

  IF v_reservation_status != 'pending' THEN
    RAISE EXCEPTION 'reservation_already_processed';
  END IF;

  UPDATE public.usage_reservations
  SET
    status = 'confirmed',
    confirmed_at = NOW()
  WHERE id = p_reservation_id;

  UPDATE public.user_subscriptions
  SET
    usage_count = usage_count + 1,
    updated_at = NOW()
  WHERE user_id = p_user_id
  RETURNING usage_count INTO v_new_count;

  RETURN QUERY SELECT TRUE, v_new_count;
END;
$$;

-- ===============================
-- 函数 3: 释放预留
-- ===============================
CREATE OR REPLACE FUNCTION public.release_usage_reservation(
  p_reservation_id UUID,
  p_user_id UUID
)
RETURNS TABLE (
  success BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_reservation_status TEXT;
BEGIN
  SELECT status
  INTO v_reservation_status
  FROM public.usage_reservations
  WHERE id = p_reservation_id
    AND user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'reservation_not_found';
  END IF;

  IF v_reservation_status != 'pending' THEN
    RAISE EXCEPTION 'reservation_already_processed';
  END IF;

  UPDATE public.usage_reservations
  SET
    status = 'released',
    released_at = NOW()
  WHERE id = p_reservation_id;

  RETURN QUERY SELECT TRUE;
END;
$$;

-- ===============================
-- 函数 4: 清理过期预留（cron / edge function）
-- ===============================
CREATE OR REPLACE FUNCTION public.cleanup_expired_reservations()
RETURNS TABLE (
  cleaned_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE public.usage_reservations
  SET
    status = 'released',
    released_at = NOW()
  WHERE status = 'pending'
    AND expires_at <= NOW();

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN QUERY SELECT v_count;
END;
$$;

-- ===============================
-- 注释
-- ===============================
COMMENT ON TABLE public.usage_reservations IS 'Tracks quota reservation lifecycle for atomic usage control';
COMMENT ON COLUMN public.usage_reservations.status IS 'pending → confirmed → released';
COMMENT ON FUNCTION public.reserve_usage_quota IS 'Atomically reserves quota: usage_count + pending < max_limit';
COMMENT ON FUNCTION public.confirm_usage_reservation IS 'Confirms reservation and increments usage count';
COMMENT ON FUNCTION public.release_usage_reservation IS 'Releases a pending reservation after failure';
COMMENT ON FUNCTION public.cleanup_expired_reservations IS 'Releases expired pending reservations (cron-safe)';
