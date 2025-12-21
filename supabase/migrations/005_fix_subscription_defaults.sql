-- 修复用户订阅的默认值和触发器
-- 确保新用户注册时自动创建 free 订阅，并设置合理的结束日期

-- 删除旧的触发器和函数
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS initialize_user_subscription();

-- 重新创建改进的初始化函数
CREATE OR REPLACE FUNCTION initialize_user_subscription()
RETURNS TRIGGER AS $$
DECLARE
  free_plan_config RECORD;
BEGIN
  -- 获取 free 方案的配置
  SELECT * INTO free_plan_config
  FROM subscription_plans_config
  WHERE plan = 'free'
  LIMIT 1;

  -- 如果找到配置，使用配置值；否则使用默认值
  IF free_plan_config IS NOT NULL THEN
    INSERT INTO user_subscriptions (
      user_id,
      plan,
      billing_period,
      usage_count,
      max_usage_limit,
      max_file_size_mb,
      max_batch_size,
      has_api_access,
      has_priority_support,
      subscription_start_date,
      subscription_end_date,
      is_active
    ) VALUES (
      NEW.id,
      'free',
      'monthly',
      0,
      free_plan_config.max_usage_limit,
      free_plan_config.max_file_size_mb,
      free_plan_config.max_batch_size,
      free_plan_config.has_api_access,
      free_plan_config.has_priority_support,
      NOW(),
      NOW() + INTERVAL '1 year', -- Free 方案有效期 1 年
      true
    );
  ELSE
    -- 使用默认值
    INSERT INTO user_subscriptions (
      user_id,
      plan,
      billing_period,
      usage_count,
      max_usage_limit,
      max_file_size_mb,
      max_batch_size,
      has_api_access,
      has_priority_support,
      subscription_start_date,
      subscription_end_date,
      is_active
    ) VALUES (
      NEW.id,
      'free',
      'monthly',
      0,
      3, -- 默认 3 次使用
      10, -- 默认 10MB
      1, -- 默认不支持批量
      false,
      false,
      NOW(),
      NOW() + INTERVAL '1 year',
      true
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 重新创建触发器
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION initialize_user_subscription();

-- 为已存在但没有订阅的用户创建 free 订阅
-- 这个脚本会检查所有用户，为没有订阅的用户创建默认订阅
DO $$
DECLARE
  user_record RECORD;
  free_plan_config RECORD;
BEGIN
  -- 获取 free 方案配置
  SELECT * INTO free_plan_config
  FROM subscription_plans_config
  WHERE plan = 'free'
  LIMIT 1;

  -- 为所有没有订阅的用户创建订阅
  FOR user_record IN
    SELECT u.id
    FROM auth.users u
    LEFT JOIN user_subscriptions us ON u.id = us.user_id
    WHERE us.id IS NULL
  LOOP
    IF free_plan_config IS NOT NULL THEN
      INSERT INTO user_subscriptions (
        user_id,
        plan,
        billing_period,
        usage_count,
        max_usage_limit,
        max_file_size_mb,
        max_batch_size,
        has_api_access,
        has_priority_support,
        subscription_start_date,
        subscription_end_date,
        is_active
      ) VALUES (
        user_record.id,
        'free',
        'monthly',
        0,
        free_plan_config.max_usage_limit,
        free_plan_config.max_file_size_mb,
        free_plan_config.max_batch_size,
        free_plan_config.has_api_access,
        free_plan_config.has_priority_support,
        NOW(),
        NOW() + INTERVAL '1 year',
        true
      );
    ELSE
      INSERT INTO user_subscriptions (
        user_id,
        plan,
        billing_period,
        usage_count,
        max_usage_limit,
        max_file_size_mb,
        max_batch_size,
        has_api_access,
        has_priority_support,
        subscription_start_date,
        subscription_end_date,
        is_active
      ) VALUES (
        user_record.id,
        'free',
        'monthly',
        0,
        3,
        10,
        1,
        false,
        false,
        NOW(),
        NOW() + INTERVAL '1 year',
        true
      );
    END IF;
  END LOOP;
END $$;

-- 添加注释
COMMENT ON FUNCTION initialize_user_subscription() IS '为新注册用户自动创建 free 订阅，使用 subscription_plans_config 中的配置';
