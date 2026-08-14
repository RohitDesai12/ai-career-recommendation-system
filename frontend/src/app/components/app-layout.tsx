import { Outlet, Navigate } from "react-router";
import { useAuth } from "../context/auth-context";
import { Sidebar } from "./sidebar";

export function AppLayout() {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <main className="flex-1 overflow-y-auto w-full">
        {/* We can optionally add a top header here later if needed for User Profile dropdown etc. */}
        <div className="h-full w-full relative">
           <Outlet />
        </div>
      </main>
    </div>
  );
}
