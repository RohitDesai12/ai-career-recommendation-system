import React, { useEffect, useRef, useState } from "react";

export type RevealEffect =
  | "fade-up"
  | "fade-in"
  | "slide-left"
  | "slide-right"
  | "zoom-in";

interface ScrollRevealProps {
  children: React.ReactNode;
  effect?: RevealEffect;
  delay?: number; // in milliseconds
  duration?: number; // in milliseconds
  distance?: number; // in pixels
  className?: string;
  as?: React.ElementType;
  threshold?: number;
  rootMargin?: string;
}

export function ScrollReveal({
  children,
  effect = "fade-up",
  delay = 0,
  duration = 700,
  distance = 24,
  className = "",
  as: Component = "div",
  threshold = 0.15,
  rootMargin = "0px 0px -40px 0px",
}: ScrollRevealProps) {
  const elementRef = useRef<HTMLElement | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check user's motion preferences
    if (typeof window !== "undefined" && window.matchMedia) {
      const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (motionQuery.matches) {
        setPrefersReducedMotion(true);
        setIsRevealed(true);
        return;
      }
    }

    const element = elementRef.current;
    if (!element) return;

    // One-time intersection observer
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsRevealed(true);
          // Unobserve immediately after the one-time trigger
          observer.unobserve(element);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin]);

  // If user prefers reduced motion, render immediately without animations
  if (prefersReducedMotion) {
    return <Component className={className}>{children}</Component>;
  }

  // Calculate initial transform styles based on chosen effect
  const getInitialTransform = () => {
    // On small screens (< 640px), convert horizontal slides to vertical fade-up to prevent horizontal scroll
    if (
      typeof window !== "undefined" &&
      window.innerWidth < 640 &&
      (effect === "slide-left" || effect === "slide-right")
    ) {
      return `translate3d(0, ${distance}px, 0)`;
    }
    switch (effect) {
      case "fade-up":
        return `translate3d(0, ${distance}px, 0)`;
      case "slide-left":
        return `translate3d(-${distance}px, 0, 0)`;
      case "slide-right":
        return `translate3d(${distance}px, 0, 0)`;
      case "zoom-in":
        return "scale(0.96)";
      case "fade-in":
      default:
        return "none";
    }
  };

  const style: React.CSSProperties = {
    opacity: isRevealed ? 1 : 0,
    transform: isRevealed ? "none" : getInitialTransform(),
    transition: `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
    willChange: isRevealed ? "auto" : "opacity, transform",
  };

  return (
    <Component
      ref={elementRef}
      style={style}
      className={className}
      data-revealed={isRevealed ? "true" : "false"}
    >
      {children}
    </Component>
  );
}

