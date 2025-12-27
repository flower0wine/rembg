"use client";

import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface SpotlightCardProps {
  children: React.ReactNode;
  className?: string;
  /** 聚光灯半径，默认 600 */
  spotlightSize?: number;
  /** 边框光晕半径，默认 400 */
  borderGlowSize?: number;
  /** 光效颜色，默认 rgba(255,255,255,0.06) */
  spotlightColor?: string;
  /** 边框光晕颜色，默认 rgba(255,255,255,0.1) */
  borderGlowColor?: string;
  /** 是否显示边框光晕，默认 true */
  showBorderGlow?: boolean;
  /** 作为 motion.div 使用，支持动画属性 */
  as?: "div" | "motion";
}

export function SpotlightCard({
  children,
  className,
  spotlightSize = 600,
  borderGlowSize = 400,
  spotlightColor = "rgba(255,255,255,0.06)",
  borderGlowColor = "rgba(255,255,255,0.1)",
  showBorderGlow = true,
  as = "div",
  ...props
}: SpotlightCardProps & React.ComponentProps<typeof motion.div>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isHovering) {
      setIsHovering(true);
    }

    if (!containerRef.current)
      return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const spotlightStyle = {
    background: `radial-gradient(${spotlightSize}px circle at ${mousePosition.x}px ${mousePosition.y}px, ${spotlightColor}, transparent 40%)`,
  };

  const borderGlowStyle = {
    background: `radial-gradient(${borderGlowSize}px circle at ${mousePosition.x}px ${mousePosition.y}px, ${borderGlowColor}, transparent 40%)`,
    mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
    WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
    maskComposite: "exclude",
    WebkitMaskComposite: "xor",
    padding: "1px",
  };

  const commonProps = {
    ref: containerRef,
    onMouseMove: handleMouseMove,
    onMouseEnter: () => setIsHovering(true),
    onMouseLeave: () => setIsHovering(false),
    className: cn("relative overflow-hidden", className),
  };

  const content = (
    <motion.div {...commonProps} {...props} className={className}>
      {/* Spotlight Effect */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300"
        style={spotlightStyle}
        animate={{ opacity: isHovering ? 1 : 0 }}
      />
      {/* Border Glow */}
      {showBorderGlow && (
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-[inherit] opacity-0 transition-opacity duration-300"
          style={borderGlowStyle}
          animate={{ opacity: isHovering ? 1 : 0 }}
        />
      )}
      {/* Content */}
      {children}
    </motion.div>
  );

  if (as === "motion") {
    return (
      content
      // <motion.div {...commonProps} {...props}>
      //   {content}
      // </motion.div>
    );
  }

  return <div {...commonProps}>{content}</div>;
}
