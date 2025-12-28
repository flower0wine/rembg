"use client";

import { useEffect } from "react";

interface OverflowHiddenProps {
  children: React.ReactNode;
}

export default function OverflowHidden({
  children,
}: OverflowHiddenProps) {
  useEffect(() => {
    const html = document.documentElement;
    const prevOverflow = html.style.overflow;

    html.style.overflow = "hidden"; // 禁用滚动

    return () => {
      html.style.overflow = prevOverflow; // 恢复
    };
  }, []);

  return (<>{children}</>);
};
