# Creem Webhook 集成指南

## 概述

本项目已集成 Creem 支付系统，支持用户订阅 Pro 计划。当用户通过 Creem 完成支付后，系统会自动升级用户的订阅状态。

## 环境变量配置

在 `.env.local` 文件中添加以下环境变量：

```bash
# Creem 配置
CREEM_API_KEY=your_creem_api_key
NEXT_PUBLIC_CREEM_PROJECT_ID=your_creem_project_id
CREEM_WEBHOOK_SECRET=your_creem_webhook_secret
```

### 获取 Creem 配置值

1. **CREEM_API_KEY**: 在 Creem 控制台的 API 设置中获取
2. **NEXT_PUBLIC_CREEM_PROJECT_ID**: 这是你的产品 ID，在产品设置中可以找到
3. **CREEM_WEBHOOK_SECRET**: 在 Creem 控制台的 Webhook 设置中获取或生成

**重要**: 如果 `CREEM_WEBHOOK_SECRET` 未设置，webhook 将无法正常工作。请确保在 Creem 控制台中配置了正确的 webhook URL 和 secret。

## Webhook 端点

- **URL**: `/api/webhook/creem`
- **方法**: POST
- **认证**: 使用 `CREEM_WEBHOOK_SECRET` 验证请求

## Webhook 事件处理

### 1. onCheckoutCompleted
当用户完成支付时触发，用于记录支付事件。

### 2. onGrantAccess
当需要授予用户访问权限时触发，会：
- 将用户订阅升级到 Pro 计划
- 重置使用次数
- 设置订阅有效期（1个月）
- 生成新的 JWT token

### 3. onRevokeAccess
当需要撤销用户访问权限时触发，会：
- 将用户订阅降级到 Free 计划
- 重置使用次数
- 更新订阅限制

## 前端集成

### PricingCard 组件
- 使用 `CreemCheckout` 组件包装 Pro 计划的购买按钮
- 自动传递用户 ID 作为 `referenceId`
- 支付成功后重定向到 `/subscription/checkout`

### 用户 ID 获取
系统直接从 Supabase 获取当前登录用户的 ID，确保安全性：

```typescript
const supabase = createClient();
const { data: { user } } = await supabase.auth.getUser();
const userId = user?.id;
```

## 支付流程

1. 用户点击 Pro 计划的"升级"按钮
2. CreemCheckout 组件打开支付页面
3. 用户完成支付
4. Creem 调用 webhook 端点
5. 系统自动升级用户订阅
6. 用户被重定向到成功页面

## 数据库更新

Webhook 会更新 `user_subscriptions` 表：
- `plan`: 更新为 'pro' 或 'free'
- `usage_count`: 重置为 0
- `subscription_start_date`: 设置为当前时间
- `subscription_end_date`: 设置订阅到期时间
- 其他限制字段根据计划配置更新

## 测试

### 本地测试
1. 使用 ngrok 或类似工具暴露本地端点
2. 在 Creem 控制台配置 webhook URL
3. 进行测试支付

### 生产环境
确保在 Creem 控制台中配置正确的生产环境 webhook URL。

## 错误处理

Webhook 包含完整的错误处理：
- 验证用户存在性
- 数据库操作错误捕获
- 详细的日志记录

## 安全考虑

1. **Webhook 验证**: 使用 `CREEM_WEBHOOK_SECRET` 验证请求来源
2. **用户验证**: 通过 Supabase Admin API 验证用户存在
3. **数据完整性**: 使用数据库事务确保数据一致性

## 监控和日志

系统会记录以下事件：
- 支付完成事件
- 订阅升级/降级操作
- 错误和异常情况

建议在生产环境中配置适当的日志监控系统。