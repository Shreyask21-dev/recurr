import { useLocation } from "wouter";
import { BellIcon, Search, Menu } from "lucide-react";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Header() {
  const [location] = useLocation();
  const [title, setTitle] = useState("Dashboard");
  const isMobile = useIsMobile();

  useEffect(() => {
    // Set page title based on current location
    if (location === "/" || location === "/dashboard") {
      setTitle("Dashboard");
    } else if (location.startsWith("/clients")) {
      setTitle("Clients");
    } else if (location.startsWith("/services")) {
      setTitle("Services");
    } else if (location.startsWith("/renewals")) {
      setTitle("Renewals");
    } else if (location.startsWith("/calendar")) {
      setTitle("Calendar");
    } else if (location.startsWith("/revenue")) {
      setTitle("Revenue");
    } else if (location.startsWith("/settings")) {
      setTitle("Settings");
    }
  }, [location]);

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-2 bg-white px-4 shadow-sm sm:px-6 lg:px-8">
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Notifications */}
          <div className="relative">
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:text-slate-600"
            >
              <BellIcon className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </button>
            <div className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></div>
          </div>

          {/* Search */}
          <div className="relative hidden md:block">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="search"
              className="w-64 rounded-md border border-gray-300 bg-white py-1.5 pl-10 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Search..."
            />
          </div>
        </div>
      </div>
    </header>
  );
}
