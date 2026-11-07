import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./utils";

const cardVariants = cva(
  "flex flex-col rounded-2xl border transition-all duration-200",
  {
    variants: {
      variant: {
        default:
          "bg-white dark:bg-card text-slate-900 dark:text-card-foreground border-slate-200/80 dark:border-border shadow-xs",
        accent:
          "bg-indigo-600 dark:bg-indigo-700 text-white border-indigo-500/50 shadow-md shadow-indigo-600/20 [&_p]:text-indigo-100 [&_span]:text-indigo-100",
        dark:
          "bg-[#111827] text-white border-slate-800 shadow-md [&_p]:text-slate-400 [&_span]:text-slate-300",
        surface:
          "bg-slate-50 dark:bg-muted/40 text-slate-900 dark:text-foreground border-slate-200/60 dark:border-border/60",
        success:
          "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 border-emerald-200 dark:border-emerald-800 [&_p]:text-emerald-700 dark:[&_p]:text-emerald-300",
        warning:
          "bg-amber-50 dark:bg-amber-950/40 text-amber-950 dark:text-amber-100 border-amber-200 dark:border-amber-800 [&_p]:text-amber-700 dark:[&_p]:text-amber-300",
        danger:
          "bg-rose-50 dark:bg-rose-950/40 text-rose-950 dark:text-rose-100 border-rose-200 dark:border-rose-800 [&_p]:text-rose-700 dark:[&_p]:text-rose-300",
      },
      hoverable: {
        true: "hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md cursor-pointer",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      hoverable: false,
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

function Card({ className, variant, hoverable, ...props }: CardProps) {
  return (
    <div
      data-slot="card"
      className={cn(cardVariants({ variant, hoverable }), className)}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 pt-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className,
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <h4
      data-slot="card-title"
      className={cn("font-bold tracking-tight text-inherit leading-none", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <p
      data-slot="card-description"
      className={cn("text-xs text-muted-foreground leading-relaxed", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className,
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6 pb-6 [&:first-child]:pt-6", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 pb-6 [.border-t]:pt-6", className)}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  cardVariants,
};
