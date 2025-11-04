import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import TopNavigation from "./components/TopNavigation";
import AnimatedDataMesh from "./components/AnimatedDataMesh";
import Index from "./pages/Index";
import BrandAnalysis from "./pages/BrandAnalysis";
import CompanyDetail from "./pages/CompanyDetail";
import RFPLifecycle from "./pages/RFPLifecycle";
import RFPDetail from "./pages/RFPDetail";
import Contracts from "./pages/Contracts";
import Deals from "./pages/Deals";
import NotFound from "./pages/NotFound";
const queryClient = new QueryClient();

const AppContent = () => {
  return (
    <div className="min-h-screen">
      {/* TopNavigation on all pages */}
      <TopNavigation />
      <main className="relative pt-16 md:pt-20">
              {/* Background Animation - Appears on all pages */}
              <div className="fixed inset-0 z-0 pointer-events-none">
                <AnimatedDataMesh />
              </div>
              
              {/* Page Content */}
              <div className="relative z-10">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/brand-analysis" element={<BrandAnalysis />} />
                  <Route path="/company/:id" element={<CompanyDetail />} />
                  <Route path="/rfp-lifecycle" element={<RFPLifecycle />} />
                <Route path="/rfp-lifecycle/:id" element={<RFPDetail />} />
                  <Route path="/contracts" element={<Contracts />} />
                  <Route path="/deals" element={<Deals />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </main>
          </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
