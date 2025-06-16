
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Sucesso from "./pages/Sucesso";
import Cancelado from "./pages/Cancelado";
import Sobre from "./pages/Sobre";
import AdminPanel from "./pages/AdminPanel";
import Staff from "./pages/Staff";
import "./i18n";
import FacebookTracker from "./components/FacebookTracker";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <FacebookTracker />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/sucesso" element={<Sucesso />} />
            <Route path="/cancelado" element={<Cancelado />} />
            <Route path="/sobre" element={<Sobre />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/staff" element={<Staff />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
