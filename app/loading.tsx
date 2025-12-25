'use client';

export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
      <div className="flex flex-col items-center gap-6">
        {/* 主加载动画 */}
        <div className="relative w-20 h-20">
          {/* 外圈旋转 */}
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary border-r-primary animate-spin" />

          {/* 中圈反向旋转 */}
          <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-primary/60 border-l-primary/60 animate-spin-reverse" />

          {/* 内圈脉冲 */}
          <div className="absolute inset-4 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 animate-pulse" />

          {/* 中心点 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          </div>
        </div>

        {/* 加载文本 */}
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">加载中</p>
          <div className="flex gap-1 justify-center mt-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>

      {/* 全局动画定义 */}
      <style jsx>{`
        @keyframes spin-reverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }

        :global(.animate-spin-reverse) {
          animation: spin-reverse 2s linear infinite;
        }
      `}</style>
    </div>
  );
}
