import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Students from "@/pages/students";
import Schedule from "@/pages/schedule";
import Packages from "@/pages/packages";
import Teachers from "@/pages/teachers";
import Reports from "@/pages/reports";
import History from "@/pages/history";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50">
        <div className="text-center">
          <div className="bg-primary-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <i className="fas fa-graduation-cap text-white text-2xl"></i>
          </div>
          <p className="text-secondary-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <div className="min-h-screen bg-secondary-50">
            <Sidebar />
            <div className="lg:ml-64">
              <Header />
              <Switch>
                <Route path="/" component={Dashboard} />
                <Route path="/students" component={Students} />
                <Route path="/schedule" component={Schedule} />
                <Route path="/packages" component={Packages} />
                <Route path="/teachers" component={Teachers} />
                <Route path="/reports" component={Reports} />
                <Route path="/history" component={History} />
                <Route component={NotFound} />
              </Switch>
            </div>
          </div>
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
