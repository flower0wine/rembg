import type { Enums, TablesInsert } from "@/lib/supabase/database.types";
import { Webhook } from "@creem_io/nextjs";
import dayjs from "dayjs";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPlanLimits } from "@/lib/supabase/subscription-plans";

// 验证环境变量
const WEBHOOK_SECRET = process.env.CREEM_WEBHOOK_SECRET;
const STARTER_PROJECT_ID = process.env.NEXT_PUBLIC_CREEM_STARTER_PROJECT_ID;
const PRO_PROJECT_ID = process.env.NEXT_PUBLIC_CREEM_PRO_PROJECT_ID;

if (!WEBHOOK_SECRET) {
  throw new Error("CREEM_WEBHOOK_SECRET environment variable is not set");
}

if (!STARTER_PROJECT_ID || !PRO_PROJECT_ID) {
  throw new Error("CREEM_STARTER_PROJECT_ID and CREEM_PRO_PROJECT_ID environment variables must be set");
}

/**
 * 根据 Creem product ID 判断订阅计划类型
 */
function getPlanFromProductId(productId: string): Enums<"subscription_plan"> {
  if (productId === STARTER_PROJECT_ID) {
    return "starter";
  }
  if (productId === PRO_PROJECT_ID) {
    return "pro";
  }
  console.error(`projectId: ${productId} 未找到对应的计划`);
  throw new Error("未找到对应的计划");
}

/**
 * Grant access to user by upgrading their subscription
 */
async function grantAccess(userId: string, customerEmail: string, plan: Enums<"subscription_plan">) {
  try {
    const supabase = createAdminClient();

    // Verify user exists using admin client
    const { data: user, error: userError } = await supabase.auth.admin.getUserById(userId);
    if (userError || !user) {
      console.error(`User not found: ${userId}`, userError);
      return;
    }

    // Get plan limits from database
    const limits = await getPlanLimits(plan);

    // Calculate subscription end date (1 month from now)
    const endDate = dayjs().add(1, "month").toISOString();

    const upsertData: TablesInsert<"user_subscriptions"> = {
      user_id: userId,
      plan,
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
    }
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
    const limits = await getPlanLimits("free");

    const upsertData: TablesInsert<"user_subscriptions"> = {
      user_id: userId,
      plan: "free",
      ...limits,
      is_active: true,
      subscription_start_date: dayjs().toISOString(),
      subscription_end_date: dayjs().add(1, "month").toISOString(),
      // 免费不再可用
      usage_count: limits.max_usage_limit,
    };

    const { error: subError } = await supabase
      .from("user_subscriptions")
      .upsert(upsertData, {
        onConflict: "user_id",
      });

    if (subError) {
      console.error("Failed to revoke access:", subError);
    }
  }
  catch (error) {
    console.error("Error revoking access:", error);
  }
}

export const POST = Webhook({
  webhookSecret: WEBHOOK_SECRET,

  onCheckoutCompleted: async ({ customer, product, metadata }) => {
    // 如果 onGrantAccess 没有被触发，我们在这里也尝试处理订阅激活
    if (customer && metadata?.referenceId && product?.id) {
      const userId = metadata.referenceId as string;
      const plan = getPlanFromProductId(product.id);
      await grantAccess(userId, customer.email, plan);
    }
  },

  onGrantAccess: async ({ customer, product, metadata }) => {
    if (!customer || !metadata?.referenceId) {
      console.error("Missing customer or referenceId in grant access webhook");
      return;
    }

    if (!product?.id) {
      console.error("Missing product ID in grant access webhook");
      return;
    }

    const userId = metadata.referenceId as string;
    const plan = getPlanFromProductId(product.id);
    await grantAccess(userId, customer.email, plan);
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