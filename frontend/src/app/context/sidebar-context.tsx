import React, { createContext, useContext, useState, useEffect } from "react";
import { useLocation } from "react-router";

interface SidebarContextType {
  isCollapsed: boolean;
  toggleCollapsed: () => void;
  setCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  openSection: string | null;
  toggleSection: (section: string) => void;
  closeSections: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);
  // Default state: ALL collapsible groups start CLOSED on page load
  const [openSection, setOpenSection] = useState<string | null>(null);
  const location = useLocation();

  // Close mobile drawer when route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  // Handle escape key to close mobile drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggleCollapsed = () => {
    setIsCollapsed((prev) => !prev);
  };

  const setCollapsed = (val: boolean) => {
    setIsCollapsed(val);
  };

  const toggleSection = (section: string) => {
    setOpenSection((prev) => (prev === section ? null : section));
  };

  const closeSections = () => {
    setOpenSection(null);
  };

  return (
    <SidebarContext.Provider
      value={{
        isCollapsed,
        toggleCollapsed,
        setCollapsed,
        isMobileOpen,
        setIsMobileOpen,
        openSection,
        toggleSection,
        closeSections
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    // Graceful fallback if rendered outside provider
    return {
      isCollapsed: false,
      toggleCollapsed: () => {},
      setCollapsed: () => {},
      isMobileOpen: false,
      setIsMobileOpen: () => {},
      openSection: null,
      toggleSection: () => {},
      closeSections: () => {}
    };
  }
  return context;
}
