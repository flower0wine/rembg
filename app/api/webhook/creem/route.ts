import type { TablesInsert } from "@/lib/supabase/database.types";
import type { BillingPeriod, SubscriptionPlan } from "@/lib/types";
import { Webhook } from "@creem_io/nextjs";
import dayjs from "dayjs";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPlanLimits } from "@/lib/supabase/subscription-plans";
import { generateToken } from "@/lib/utils/jwt";

// 验证环境变量
const WEBHOOK_SECRET = process.env.CREEM_WEBHOOK_SECRET;

if (!WEBHOOK_SECRET) {
  throw new Error("CREEM_WEBHOOK_SECRET environment variable is not set");
}

/**
 * Grant access to user by upgrading their subscription
 */
async function grantAccess(userId: string, customerEmail: string) {
  try {
    const supabase = createAdminClient();

    // Verify user exists using admin client
    const { data: user, error: userError } = await supabase.auth.admin.getUserById(userId);
    if (userError || !user) {
      console.error(`User not found: ${userId}`, userError);
      return;
    }

    // Get Pro plan limits from database
    const limits = await getPlanLimits("pro" as SubscriptionPlan);

    // Calculate subscription end date (1 month from now)
    const endDate = dayjs().add(1, "month").toISOString();

    const upsertData: TablesInsert<"user_subscriptions"> = {
      user_id: userId,
      plan: "pro" as SubscriptionPlan,
      billing_period: "monthly" as BillingPeriod,
      ...limits,
      is_active: true,
      subscription_start_date: dayjs().toISOString(),
      subscription_end_date: endDate,
      usage_count: 0, // Reset usage count on upgrade
    };

    const { data: subscription, error: subError } = await supabase
      .from("user_subscriptions")
      .upsert(upsertData, {
        onConflict: "user_id",
      })
      .select()
      .single();

    if (subError) {
      console.error("Failed to grant access:", subError);
      return;
    }

    console.log(`Successfully granted Pro access to user ${customerEmail}`);

    // Generate new JWT token with updated subscription info
    generateToken({
      userId: user.user.id,
      email: user.user.email!,
      plan: subscription.plan,
      usageCount: subscription.usage_count,
      maxUsageLimit: subscription.max_usage_limit,
      maxFileSizeMb: subscription.max_file_size_mb,
      maxBatchSize: subscription.max_batch_size,
      hasApiAccess: subscription.has_api_access,
    });
  }
  catch (error) {
    console.error("Error granting access:", error);
  }
}

/**
 * Revoke access by downgrading user to free plan
 */
async function revokeAccess(userId: string, customerEmail: string) {
  try {
    const supabase = createAdminClient();

    // Verify user exists using admin client
    const { data: user, error: userError } = await supabase.auth.admin.getUserById(userId);
    if (userError || !user) {
      console.error(`User not found: ${userId}`, userError);
      return;
    }

    // Get Free plan limits from database
    const limits = await getPlanLimits("free" as SubscriptionPlan);

    const upsertData: TablesInsert<"user_subscriptions"> = {
      user_id: userId,
      plan: "free" as SubscriptionPlan,
      billing_period: "monthly" as BillingPeriod,
      ...limits,
      is_active: true,
      subscription_start_date: dayjs().toISOString(),
      subscription_end_date: dayjs().add(1, "month").toISOString(),
      usage_count: 0, // Reset usage count on downgrade
    };

    const { error: subError } = await supabase
      .from("user_subscriptions")
      .upsert(upsertData, {
        onConflict: "user_id",
      });

    if (subError) {
      console.error("Failed to revoke access:", subError);
      return;
    }

    console.log(`Successfully revoked Pro access for user ${customerEmail}`);
  }
  catch (error) {
    console.error("Error revoking access:", error);
  }
}

export const POST = Webhook({
  webhookSecret: WEBHOOK_SECRET,

  onCheckoutCompleted: async ({ customer, product, metadata }) => {
    // 如果 onGrantAccess 没有被触发，我们在这里也尝试处理订阅激活
    if (customer && metadata?.referenceId) {
      const userId = metadata.referenceId as string;
      await grantAccess(userId, customer.email);
    }
  },

  onGrantAccess: async ({ customer, metadata }) => {
    if (!customer || !metadata?.referenceId) {
      console.error("Missing customer or referenceId in grant access webhook");
      return;
    }

    const userId = metadata.referenceId as string;
    await grantAccess(userId, customer.email);
  },

  onRevokeAccess: async ({ customer, metadata }) => {
    if (!customer || !metadata?.referenceId) {
      console.error("Missing customer or referenceId in revoke access webhook");
      return;
    }

    const userId = metadata.referenceId as string;
    await revokeAccess(userId, customer.email);
  },
});