-- 创建使用记录表，用于跟踪每次使用的状态
CREATE TABLE IF NOT EXISTS usage_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'released')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  released_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  metadata JSONB
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_usage_reservations_user_id ON usage_reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_reservations_status ON usage_reservations(status);
CREATE INDEX IF NOT EXISTS idx_usage_reservations_expires_at ON usage_reservations(expires_at);

-- 添加 RLS 策略
ALTER TABLE usage_reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reservations"
  ON usage_reservations
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage reservations"
  ON usage_reservations
  FOR ALL
  USING (true)
  WITH CHECK (true);


-- 函数1: 预留额度（原子性检查并创建预留记录）
CREATE OR REPLACE FUNCTION reserve_usage_quota(
  p_user_id UUID,
  p_timeout_seconds INTEGER DEFAULT 300  -- 默认5分钟超时
)
RETURNS TABLE (
  reservation_id UUID,
  current_usage INTEGER,
  max_limit INTEGER,
  plan subscription_plan
) AS $$
DECLARE
  v_current_count INTEGER;
  v_pending_count INTEGER;
  v_max_limit INTEGER;
  v_plan subscription_plan;
  v_is_active BOOLEAN;
  v_reservation_id UUID;
BEGIN
  -- 使用 FOR UPDATE 锁定该用户的订阅记录
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
  FROM user_subscriptions us
  WHERE us.user_id = p_user_id
  FOR UPDATE;

  -- 检查记录是否存在
  IF NOT FOUND THEN
    RAISE EXCEPTION 'subscription_not_found';
  END IF;

  -- 检查订阅是否激活
  IF NOT v_is_active THEN
    RAISE EXCEPTION 'subscription_inactive';
  END IF;

  -- 计算当前 pending 的预留数量（未过期的）
  SELECT COUNT(*)
  INTO v_pending_count
  FROM usage_reservations
  WHERE user_id = p_user_id
    AND status = 'pending'
    AND expires_at > NOW();

  -- 检查是否已达到额度上限（已确认的 + pending 的）
  IF (v_current_count + v_pending_count) >= v_max_limit THEN
    RAISE EXCEPTION 'quota_exceeded';
  END IF;

  -- 创建预留记录
  INSERT INTO usage_reservations (
    user_id,
    status,
    expires_at
  ) VALUES (
    p_user_id,
    'pending',
    NOW() + (p_timeout_seconds || ' seconds')::INTERVAL
  )
  RETURNING id INTO v_reservation_id;

  -- 返回预留信息
  RETURN QUERY
  SELECT 
    v_reservation_id,
    v_current_count,
    v_max_limit,
    v_plan;
END;
$$ LANGUAGE plpgsql;


-- 函数2: 确认使用（处理成功后调用）
CREATE OR REPLACE FUNCTION confirm_usage_reservation(
  p_reservation_id UUID,
  p_user_id UUID
)
RETURNS TABLE (
  success BOOLEAN,
  new_usage_count INTEGER
) AS $$
DECLARE
  v_reservation_status TEXT;
  v_new_count INTEGER;
BEGIN
  -- 检查预留记录是否存在且属于该用户
  SELECT status
  INTO v_reservation_status
  FROM usage_reservations
  WHERE id = p_reservation_id
    AND user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'reservation_not_found';
  END IF;

  -- 检查预留状态
  IF v_reservation_status != 'pending' THEN
    RAISE EXCEPTION 'reservation_already_processed';
  END IF;

  -- 更新预留状态为已确认
  UPDATE usage_reservations
  SET 
    status = 'confirmed',
    confirmed_at = NOW()
  WHERE id = p_reservation_id;

  -- 增加用户的使用次数
  UPDATE user_subscriptions
  SET 
    usage_count = usage_count + 1,
    updated_at = NOW()
  WHERE user_id = p_user_id
  RETURNING usage_count INTO v_new_count;

  RETURN QUERY SELECT TRUE, v_new_count;
END;
$$ LANGUAGE plpgsql;


-- 函数3: 释放预留（处理失败后调用）
CREATE OR REPLACE FUNCTION release_usage_reservation(
  p_reservation_id UUID,
  p_user_id UUID
)
RETURNS TABLE (
  success BOOLEAN
) AS $$
DECLARE
  v_reservation_status TEXT;
BEGIN
  -- 检查预留记录是否存在且属于该用户
  SELECT status
  INTO v_reservation_status
  FROM usage_reservations
  WHERE id = p_reservation_id
    AND user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'reservation_not_found';
  END IF;

  -- 检查预留状态
  IF v_reservation_status != 'pending' THEN
    RAISE EXCEPTION 'reservation_already_processed';
  END IF;

  -- 更新预留状态为已释放
  UPDATE usage_reservations
  SET 
    status = 'released',
    released_at = NOW()
  WHERE id = p_reservation_id;

  RETURN QUERY SELECT TRUE;
END;
$$ LANGUAGE plpgsql;


-- 函数4: 清理过期的预留记录（定期任务调用）
CREATE OR REPLACE FUNCTION cleanup_expired_reservations()
RETURNS TABLE (
  cleaned_count INTEGER
) AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- 将过期的 pending 预留标记为 released
  UPDATE usage_reservations
  SET 
    status = 'released',
    released_at = NOW()
  WHERE status = 'pending'
    AND expires_at <= NOW();

  GET DIAGNOSTICS v_count = ROW_COUNT;

  RETURN QUERY SELECT v_count;
END;
$$ LANGUAGE plpgsql;

-- 添加函数注释
COMMENT ON FUNCTION reserve_usage_quota IS '原子性地预留使用额度。检查当前使用量+pending数量，如果未超限则创建预留记录。';
COMMENT ON FUNCTION confirm_usage_reservation IS '确认预留并增加使用计数。只在处理成功后调用。';
COMMENT ON FUNCTION release_usage_reservation IS '释放预留额度。在处理失败时调用，归还额度。';
COMMENT ON FUNCTION cleanup_expired_reservations IS '清理过期的预留记录。建议通过定时任务定期调用。';
