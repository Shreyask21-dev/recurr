import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";

import Dashboard from "@/pages/dashboard";
import ClientsPage from "@/pages/clients";
import NewClientPage from "@/pages/clients/new";
import ClientDetailsPage from "@/pages/clients/[id]";
import ServicesPage from "@/pages/services";
import NewServicePage from "@/pages/services/new";
import ServiceDetailsPage from "@/pages/services/[id]";
import RenewalsPage from "@/pages/renewals";
import NewRenewalPage from "@/pages/renewals/new";
import RenewalDetailsPage from "@/pages/renewals/[id]";
import CalendarPage from "@/pages/calendar";
import RevenuePage from "@/pages/revenue";
import SettingsPage from "@/pages/settings";
import NotFound from "@/pages/not-found";
import { AuthProvider } from "./lib/auth";
// Added imports
import LoginPage from "@/pages/login"; // Assumed location for LoginPage component
import { useAuth } from "./lib/auth"; // Assumed location for useAuth hook


function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AuthenticatedApp />
      </AuthProvider>
    </QueryClientProvider>
  );
}

function AuthenticatedApp() {
  const auth = useAuth();
  const [location] = useLocation();

  // Redirect to login if not authenticated and not already on login page
  if (!auth.isAuthenticated && location !== '/login') {
    window.location.href = '/login';
    return null;
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
          {auth.isAuthenticated && <Sidebar />}
          <div className="flex-1 flex flex-col">
            <Header />
            <main className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6 lg:p-8">
              <Switch>
                <Route path="/login" component={LoginPage} />
                {auth.isAuthenticated ? (
                  <>
                    <Route path="/" component={Dashboard} />
                    <Route path="/dashboard" component={Dashboard} />
                    <Route path="/clients" component={ClientsPage} />
                    <Route path="/clients/new" component={NewClientPage} />
                    <Route path="/clients/:id" component={ClientDetailsPage} />
                    <Route path="/services" component={ServicesPage} />
                    <Route path="/services/new" component={NewServicePage} />
                    <Route path="/services/:id" component={ServiceDetailsPage} />
                    <Route path="/renewals" component={RenewalsPage} />
                    <Route path="/renewals/new" component={NewRenewalPage} />
                    <Route path="/renewals/:id" component={RenewalDetailsPage} />
                    <Route path="/calendar" component={CalendarPage} />
                    <Route path="/revenue" component={RevenuePage} />
                    <Route path="/settings" component={SettingsPage} />
                  </>
                ) : (
                  <Route component={LoginPage} />
                )}
                <Route component={NotFound} />
              </Switch>
            </main>
          </div>
        </div>
  );
}

export default App;