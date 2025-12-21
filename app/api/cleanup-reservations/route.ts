import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * 清理过期的预留记录
 * 建议通过 Cron Job 定期调用（如每5分钟一次）
 * 或者在 Supabase 中设置 pg_cron 定时任务
 */
export async function POST() {
  try {
    const supabase = await createClient();

    // 调用清理函数
    const { data, error } = await (supabase as any)
      .rpc("cleanup_expired_reservations");

    if (error) {
      console.error("清理过期预留失败:", error);
      return NextResponse.json(
        { error: "清理失败" },
        { status: 500 }
      );
    }

    const cleanedCount = data?.[0]?.cleaned_count || 0;

    return NextResponse.json({
      success: true,
      cleaned_count: cleanedCount,
      message: `已清理 ${cleanedCount} 条过期预留记录`
    });
  }
  catch (error) {
    console.error("清理过期预留错误:", error);
    return NextResponse.json(
      { error: "清理失败" },
      { status: 500 }
    );
  }
}
