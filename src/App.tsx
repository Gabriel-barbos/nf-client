import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import Pedidos from "./pages/Pedidos";
import Destinatarios from "./pages/Destinatarios";
import Historico from "./pages/Historico";
import NotFound from "./pages/NotFound";
import Resultados from "./pages/Resultados";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Pedidos />} />
            <Route path="/destinatarios" element={<Destinatarios />} />
            <Route path="/historico" element={<Historico />} />
            <Route path="/resultados" element={<Resultados />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
