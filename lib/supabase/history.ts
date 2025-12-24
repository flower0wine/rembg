import type { TablesInsert, TablesUpdate } from "./database.types";
import { toError } from "@/lib/utils";
import { createClient } from "./server";

// 创建处理历史记录
export async function createProcessingHistory(
  insertData: TablesInsert<"processing_history">
): Promise<string> {
  try {
    const supabase = await createClient();
    const { data: result, error } = await supabase
      .from("processing_history")
      .insert(insertData)
      .select("id")
      .single();

    if (error) {
      throw error;
    }

    return result.id;
  }
  catch (error) {
    const err = toError(error);
    throw new Error(`创建处理历史失败: ${err.message}`);
  }
}

// 更新处理历史记录
export async function updateProcessingHistory(
  historyId: string,
  updateData: TablesUpdate<"processing_history">
): Promise<void> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("processing_history")
      .update(updateData)
      .eq("id", historyId);

    if (error) {
      throw error;
    }

    console.log("更新历史记录成功", updateData);
  }
  catch (error) {
    const err = toError(error);
    throw new Error(`更新处理历史失败: ${err.message}`);
  }
}
