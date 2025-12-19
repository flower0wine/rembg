"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { HistoryList } from "@/components/features/history/history-list";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  useDeleteAllHistory,
  useDeleteHistory,
  useHistory,
} from "@/lib/hooks/use-history";

const ITEMS_PER_PAGE = 10;

export function HistoryClient() {
  const [page, setPage] = useState(0);
  const [deleteAllOpen, setDeleteAllOpen] = useState(false);
  const offset = page * ITEMS_PER_PAGE;

  // Fetch history with pagination
  const {
    data: historyData,
    isLoading,
    error,
    refetch,
  } = useHistory({
    limit: ITEMS_PER_PAGE,
    offset,
    orderBy: "created_at",
    orderDirection: "desc",
  });

  // Delete mutations
  const deleteHistoryMutation = useDeleteHistory();
  const deleteAllHistoryMutation = useDeleteAllHistory();

  const items = historyData?.data || [];
  const totalCount = historyData?.count || 0;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const hasNextPage = page < totalPages - 1;
  const hasPrevPage = page > 0;

  const handleDelete = async (id: string) => {
    try {
      await deleteHistoryMutation.mutateAsync(id);
      toast.success("记录已删除");
    }
    catch (error) {
      toast.error("删除失败，请重试");
      console.error("Delete error:", error);
    }
  };

  const handleDeleteAll = () => {
    setDeleteAllOpen(true);
  };

  const confirmDeleteAll = async () => {
    try {
      await deleteAllHistoryMutation.mutateAsync();
      toast.success("所有记录已删除");
      setPage(0);
      setDeleteAllOpen(false);
    }
    catch (error) {
      toast.error("删除失败，请重试");
      console.error("Delete all error:", error);
    }
  };

  const handlePrevPage = () => {
    if (hasPrevPage) {
      setPage(page - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleNextPage = () => {
    if (hasNextPage) {
      setPage(page + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <>
      <HistoryList
        items={items}
        isLoading={isLoading}
        error={error}
        onDelete={handleDelete}
        onDeleteAll={items.length > 0 ? handleDeleteAll : undefined}
        onRetry={() => void refetch()}
      />

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between border-t pt-6">
          <div className="text-sm text-muted-foreground">
            第
            {" "}
            {page + 1}
            {" "}
            页，共
            {" "}
            {totalPages}
            {" "}
            页
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={!hasPrevPage || isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
              上一页
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={!hasNextPage || isLoading}
            >
              下一页
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <AlertDialog open={deleteAllOpen} onOpenChange={setDeleteAllOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除所有历史记录吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              className={buttonVariants({ variant: "destructive" })}
              onClick={(e: React.MouseEvent) => {
                e.preventDefault();
                void confirmDeleteAll();
              }}
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
