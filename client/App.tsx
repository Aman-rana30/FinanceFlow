import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Investments from "./pages/Investments";
import Stocks from "./pages/Stocks";
import Expenses from "./pages/Expenses";
import Goals from "./pages/Goals";
import Insights from "./pages/Insights";
import Challenges from "./pages/Challenges";
import Coach from "./pages/Coach";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import { Navbar } from "@/components/layout/Navbar";
import { CommandK } from "@/components/layout/CommandK";

const queryClient = new QueryClient();

import { useEffect } from "react";
import { useUIStore } from "@/store/ui";
import { useAuth } from "@/store/auth";

function GlobalEvents() {
  const toggleMasked = useUIStore((s) => s.toggleMasked);
  const togglePanic = useUIStore((s) => s.togglePanic);
  useEffect(() => {
    const onMasked = () => toggleMasked();
    const onPanic = () => togglePanic();
    document.addEventListener("toggle-masked", onMasked as EventListener);
    document.addEventListener("toggle-panic", onPanic as EventListener);
    return () => {
      document.removeEventListener("toggle-masked", onMasked as EventListener);
      document.removeEventListener("toggle-panic", onPanic as EventListener);
    };
  }, [toggleMasked, togglePanic]);
  return null;
}

function Shell() {
  const location = useLocation();
  const isLanding = location.pathname === "/";
  const isAuth = location.pathname.startsWith("/auth");
  return (
    <>
      {!isLanding && !isAuth && <Navbar />}
      {!isLanding && !isAuth && <CommandK />}
      <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />

          {/* Block /features for unauthenticated users by redirecting to /auth */}
          <Route path="/features" element={<Gate element={<Index />} />} />

          {/* Protected routes */}
          <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
          <Route path="/investments" element={<ProtectedRoute element={<Investments />} />} />
          <Route path="/stocks" element={<ProtectedRoute element={<Stocks />} />} />
          <Route path="/expenses" element={<ProtectedRoute element={<Expenses />} />} />
          <Route path="/goals" element={<ProtectedRoute element={<Goals />} />} />
          <Route path="/insights" element={<ProtectedRoute element={<Insights />} />} />
          <Route path="/challenges" element={<ProtectedRoute element={<Challenges />} />} />
          <Route path="/coach" element={<ProtectedRoute element={<Coach />} />} />
          <Route path="/settings" element={<ProtectedRoute element={<Settings />} />} />

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <GlobalEvents />
        <Shell />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

function ProtectedRoute({ element }: { element: React.ReactElement }) {
  const { user, token } = useAuth();
  if (!user || !token) {
    return <Navigate to="/auth" replace />;
  }
  return element;
}

function Gate({ element }: { element: React.ReactElement }) {
  // Redirect unauthenticated users to /auth
  const { user, token } = useAuth();
  if (!user || !token) return <Navigate to="/auth" replace />;
  return element;
}

createRoot(document.getElementById("root")!).render(<App />);
