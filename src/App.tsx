import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PlannerProvider } from "@/context/PlannerContext";
import Index from "./pages/Index";
import Today from "./pages/Today";
import CalendarPage from "./pages/CalendarPage";
import Goals from "./pages/Goals";
import Performance from "./pages/Performance";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <PlannerProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/today" element={<Today />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/performance" element={<Performance />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </PlannerProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
