
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";

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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* User routes */}
          <Route path="/" element={<AppLayout userRole="user" />}>
            <Route index element={<Dashboard />} />
            <Route path="belanja" element={<Belanja />} />
            <Route path="pembayaran" element={<Pembayaran />} />
            <Route path="riwayat" element={<Riwayat />} />
          </Route>

          {/* Admin routes */}
          <Route path="/admin" element={<AppLayout userRole="admin" />}>
            <Route index element={<Navigate to="/admin/products" replace />} />
            <Route path="products" element={<Products />} />
            <Route path="packages" element={<Packages />} />
            <Route path="termins" element={<Termins />} />
            <Route path="users" element={<Users />} />
          </Route>

          {/* 404 page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
