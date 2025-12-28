"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import { motion } from "framer-motion";
import * as React from "react";

import { cn } from "@/lib/utils/index";

// Context for animated tabs
interface TabsContextValue {
  activeTab: string;
  layoutId: string;
  listRef: React.RefObject<HTMLDivElement | null>;
  scrollToCenter: (element: HTMLElement) => void;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabsContext() {
  return React.useContext(TabsContext);
}

function Tabs({
  className,
  defaultValue,
  value,
  onValueChange,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  const [activeTab, setActiveTab] = React.useState(value || defaultValue || "");
  const layoutId = React.useId();
  const listRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (value !== undefined) {
      setActiveTab(value);
    }
  }, [value]);

  const scrollToCenter = React.useCallback((element: HTMLElement) => {
    const container = listRef.current;
    if (!container)
      return;

    const containerRect = container.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();

    // 计算元素相对于容器的位置
    const elementCenter = elementRect.left + elementRect.width / 2;
    const containerCenter = containerRect.left + containerRect.width / 2;
    const scrollOffset = elementCenter - containerCenter;

    container.scrollBy({
      left: scrollOffset,
      behavior: "smooth",
    });
  }, []);

  const handleValueChange = (newValue: string) => {
    setActiveTab(newValue);
    onValueChange?.(newValue);
  };

  return (
    <TabsContext.Provider value={{ activeTab, layoutId, listRef, scrollToCenter }}>
      <TabsPrimitive.Root
        data-slot="tabs"
        className={cn("flex flex-col gap-2", className)}
        defaultValue={defaultValue}
        value={value}
        onValueChange={handleValueChange}
        {...props}
      />
    </TabsContext.Provider>
  );
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  const context = useTabsContext();

  return (
    <TabsPrimitive.List
      ref={context?.listRef as React.Ref<HTMLDivElement>}
      data-slot="tabs-list"
      className={cn(
        "bg-muted text-muted-foreground relative inline-flex h-9 w-fit items-center rounded-lg p-0.75 overflow-x-auto no-scrollbar",
        className
      )}
      {...props}
    />
  );
}

interface TabsTriggerProps
  extends React.ComponentProps<typeof TabsPrimitive.Trigger> {
  /** 是否启用动画指示器 */
  animated?: boolean;
}

function TabsTrigger({
  className,
  value,
  animated = true,
  children,
  ...props
}: TabsTriggerProps) {
  const context = useTabsContext();
  const isActive = context?.activeTab === value;
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  const handleClick = () => {
    if (triggerRef.current && context?.scrollToCenter) {
      context.scrollToCenter(triggerRef.current);
    }
  };

  return (
    <TabsPrimitive.Trigger
      ref={triggerRef}
      data-slot="tabs-trigger"
      value={value}
      onClick={handleClick}
      className={cn(
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring text-foreground dark:text-muted-foreground relative z-10 inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        isActive && "dark:text-foreground",
        !animated
        && "data-[state=active]:bg-background dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 data-[state=active]:shadow-sm transition-[color,box-shadow]",
        className
      )}
      {...props}
    >
      {/* 动画背景指示器 */}
      {animated && isActive && context && (
        <motion.span
          layoutId={context.layoutId}
          className="bg-background absolute inset-0 rounded-md shadow-sm"
          style={{ zIndex: -1 }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 35,
          }}
        />
      )}
      {children}
    </TabsPrimitive.Trigger>
  );
}

interface TabsContentProps
  extends React.ComponentProps<typeof TabsPrimitive.Content> {
  /** 是否启用内容切换动画 */
  animated?: boolean;
}

function TabsContent({
  className,
  animated = true,
  children,
  ...props
}: TabsContentProps) {
  if (animated) {
    return (
      <TabsPrimitive.Content
        data-slot="tabs-content"
        className={cn("flex-1 outline-none", className)}
        {...props}
      >
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 35,
          }}
        >
          {children}
        </motion.div>
      </TabsPrimitive.Content>
    );
  }

  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    >
      {children}
    </TabsPrimitive.Content>
  );
}

export { Tabs, TabsContent, TabsList, TabsTrigger };
