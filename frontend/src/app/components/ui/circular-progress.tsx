import React from "react";
import { cn } from "./utils";

export interface CircularProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | number;
  strokeWidth?: number;
  variant?: "primary" | "success" | "warning" | "danger" | "info" | "auto";
  trackColor?: string;
  color?: string;
  showValue?: boolean;
  valueSuffix?: string;
  label?: string;
  children?: React.ReactNode;
}

const SIZE_MAP: Record<string, { sizeClass: string; stroke: number; textClass: string }> = {
  xs: { sizeClass: "w-8 h-8", stroke: 8, textClass: "text-[9px] font-bold" },
  sm: { sizeClass: "w-11 h-11", stroke: 7.5, textClass: "text-xs font-bold" },
  md: { sizeClass: "w-14 h-14", stroke: 7.5, textClass: "text-xs font-bold" },
  lg: { sizeClass: "w-20 h-20", stroke: 7, textClass: "text-sm font-black" },
  xl: { sizeClass: "w-24 h-24", stroke: 6.5, textClass: "text-lg font-black font-heading" },
  "2xl": { sizeClass: "w-32 h-32", stroke: 6, textClass: "text-2xl font-black font-heading" },
};

export function CircularProgress({
  value = 0,
  size = "md",
  strokeWidth,
  variant = "auto",
  trackColor,
  color,
  showValue = true,
  valueSuffix = "%",
  label,
  children,
  className,
  ...props
}: CircularProgressProps) {
  const numericValue = typeof value === "number" && !isNaN(value) ? value : 0;
  const clampedValue = Math.min(100, Math.max(0, numericValue));
  const roundedValue = Math.round(clampedValue);

  // SVG Geometry configuration
  // Using viewBox 0 0 100 100 with radius 40 gives 10px margin to bounds.
  const radius = 40;
  const circumference = 2 * Math.PI * radius; // ~251.327
  const strokeDashoffset = circumference - (clampedValue / 100) * circumference;

  let sizeConfig = typeof size === "string" ? SIZE_MAP[size] || SIZE_MAP.md : null;
  const actualStrokeWidth = strokeWidth ?? (sizeConfig ? sizeConfig.stroke : 7.5);

  // Determine stroke color
  let strokeClass = "stroke-primary";
  if (color) {
    strokeClass = "";
  } else if (variant === "auto") {
    if (clampedValue >= 75) strokeClass = "stroke-emerald-500 text-emerald-500";
    else if (clampedValue >= 50) strokeClass = "stroke-amber-500 text-amber-500";
    else if (clampedValue > 0) strokeClass = "stroke-indigo-600 text-indigo-600";
    else strokeClass = "stroke-slate-400 text-slate-400";
  } else if (variant === "primary") {
    strokeClass = "stroke-indigo-600 dark:stroke-indigo-400 text-indigo-600";
  } else if (variant === "success") {
    strokeClass = "stroke-emerald-500 text-emerald-500";
  } else if (variant === "warning") {
    strokeClass = "stroke-amber-500 text-amber-500";
  } else if (variant === "danger") {
    strokeClass = "stroke-rose-500 text-rose-500";
  } else if (variant === "info") {
    strokeClass = "stroke-blue-500 text-blue-500";
  }

  const customStyle: React.CSSProperties = typeof size === "number" ? { width: size, height: size } : {};

  return (
    <div
      className={cn(
        "relative flex-shrink-0 flex items-center justify-center select-none",
        sizeConfig ? sizeConfig.sizeClass : "",
        className
      )}
      style={customStyle}
      role="progressbar"
      aria-valuenow={roundedValue}
      aria-valuemin={0}
      aria-valuemax={100}
      {...props}
    >
      <svg
        className="w-full h-full overflow-visible"
        viewBox="0 0 100 100"
        style={{ transform: "rotate(-90deg)" }}
      >
        {/* Background Track Circle */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          className={cn(trackColor || "stroke-slate-200 dark:stroke-slate-700/60", "fill-none")}
          strokeWidth={actualStrokeWidth}
        />

        {/* Dynamic Progress Arc */}
        {clampedValue > 0 && (
          <circle
            cx="50"
            cy="50"
            r={radius}
            className={cn(strokeClass, "fill-none transition-all duration-700 ease-out")}
            stroke={color}
            strokeWidth={actualStrokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap={clampedValue >= 100 ? "square" : "round"}
          />
        )}
      </svg>

      {/* Centered Value / Icon / Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center leading-none">
        {children ? (
          children
        ) : showValue ? (
          <span className={cn(sizeConfig?.textClass || "text-xs font-bold", "text-slate-900 dark:text-white tracking-tight")}>
            {roundedValue}
            {valueSuffix}
          </span>
        ) : null}
        {label && (
          <span className="text-[9px] uppercase tracking-wider text-muted-foreground mt-0.5 font-semibold">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}

export default CircularProgress;
