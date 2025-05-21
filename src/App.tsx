
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import { AuthProvider } from "./context/AuthContext";
import { AuthGuard } from "./components/AuthGuard";
import React, { useEffect } from "react";
import { setupSpecialAdmin } from "./integrations/supabase/client";

// Auth page
import Auth from "./pages/Auth";

// User pages
import Dashboard from "./pages/Dashboard";
import Belanja from "./pages/user/Belanja";
import Pembayaran from "./pages/user/Pembayaran";
import Riwayat from "./pages/user/Riwayat";

// Admin pages
import Products from "./pages/admin/Products";
import Packages from "./pages/admin/Packages";
import Termins from "./pages/admin/Termins";
import Users from "./pages/admin/Users";

// Not found page
import NotFound from "./pages/NotFound";

const AppContent = () => {
  useEffect(() => {
    // Attempt to setup the special admin on app load
    setupSpecialAdmin();
  }, []);

  return (
    <Routes>
      {/* Auth routes */}
      <Route path="/auth" element={<Auth />} />
      
      {/* Main app routes with auth check */}
      <Route element={<AuthGuard requireAuth={true} />}>
        <Route element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="belanja" element={<Belanja />} />
          <Route path="pembayaran" element={<Pembayaran />} />
          <Route path="riwayat" element={<Riwayat />} />
          
          {/* Admin routes with admin check */}
          <Route element={<AuthGuard requireAdmin={true} />}>
            <Route path="admin">
              <Route index element={<Navigate to="/admin/products" replace />} />
              <Route path="products" element={<Products />} />
              <Route path="packages" element={<Packages />} />
              <Route path="termins" element={<Termins />} />
              <Route path="users" element={<Users />} />
            </Route>
          </Route>
        </Route>
      </Route>

      {/* 404 page */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  // Create a client inside the component to ensure proper React context
  const queryClient = new QueryClient();
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
