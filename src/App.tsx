import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import RecordatorioCompras from "./pages/RecordatorioCompras";
import PeludoProfile from "./pages/PeludoProfile";
import AdminAuth from "./pages/AdminAuth";
import AdminPeludos from "./pages/AdminPeludos";
import AdminFinanzas from "./pages/AdminFinanzas";
import AdminBoutique from "./pages/AdminBoutique";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/recordatorio-compras" element={<RecordatorioCompras />} />
          <Route path="/recordatoriocompras" element={<RecordatorioCompras />} />
          <Route path="/peludos/:codigo" element={<PeludoProfile />} />
          <Route path="/admin" element={<AdminAuth />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/peludos" element={<AdminPeludos />} />
          <Route path="/admin/finanzas" element={<AdminFinanzas />} />
          <Route path="/admin/boutique" element={<AdminBoutique />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
