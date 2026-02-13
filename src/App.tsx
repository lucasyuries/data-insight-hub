import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import SurveyAnalysis from "./pages/SurveyAnalysis";
import CompanyComparison from "./pages/CompanyComparison";
import Demographics from "./pages/Demographics";
import Heatmap from "./pages/Heatmap";
import Reports from "./pages/Reports";
import GoogleSheetsConfig from "./pages/GoogleSheetsConfig";
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
          <Route path="/analise" element={<SurveyAnalysis />} />
          <Route path="/empresas" element={<CompanyComparison />} />
          <Route path="/demografico" element={<Demographics />} />
          <Route path="/heatmap" element={<Heatmap />} />
          <Route path="/relatorios" element={<Reports />} />
          <Route path="/integracoes" element={<GoogleSheetsConfig />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
