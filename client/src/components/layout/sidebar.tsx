
import { useAuth } from "@/lib/auth";

function LogoutButton() {
  const auth = useAuth();

  const handleLogout = () => {
    auth.logout();
    window.location.href = '/login';
  };

  return (
    <button
      type="button"
      className="p-2 text-gray-400 bg-white rounded-full hover:text-gray-500 focus:outline-none"
      onClick={handleLogout}
    >
      <LogOut className="w-5 h-5" />
    </button>
  );
}


import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Home,
  Users,
  Briefcase,
  Clock,
  Calendar,
  BarChart2,
  Settings,
  LogOut,
  X,
  Menu
} from "lucide-react";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: Home },
  { path: "/clients", label: "Clients", icon: Users },
  { path: "/services", label: "Services", icon: Briefcase },
  { path: "/renewals", label: "Renewals", icon: Clock },
  { path: "/calendar", label: "Calendar", icon: Calendar },
  { path: "/revenue", label: "Revenue", icon: BarChart2 },
  { path: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!isMobile) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [isMobile]);

  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    }
  }, [location, isMobile]);

  return (
    <>
      {/* {isMobile && (
        <button
          type="button"
          className="fixed bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white shadow-lg z-30"
          onClick={() => setIsOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </button>
      )} */}

      {/* {isMobile && !isOpen && (
        <button
          type="button"
          className="fixed top-4 left-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white shadow-lg"
          onClick={() => setIsOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </button>
      )} */}

      {isMobile && !isOpen && (
        <button
          type="button"
          className="fixed top-4 right-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white shadow-lg"
          onClick={() => setIsOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </button>
      )}



      {/* <aside
        className={`${
          isOpen
            ? "fixed inset-y-0 z-20 flex flex-col flex-shrink-0 w-64 min-h-screen bg-white border-r shadow-lg lg:z-auto lg:static lg:shadow-none"
            : "hidden lg:fixed lg:inset-y-0 lg:z-20 lg:flex lg:flex-col lg:flex-shrink-0 lg:w-64 lg:min-h-screen lg:bg-white lg:border-r lg:shadow-lg lg:z-auto lg:static lg:shadow-none"
        }`}
      > */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full w-64 bg-white shadow-md transform transition-transform duration-300 ease-in-out
    ${isOpen ? "translate-x-0" : "-translate-x-full"} 
    lg:translate-x-0 lg:static lg:shadow-none`}
      >
        <div className="flex items-center justify-between flex-shrink-0 p-4">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <span className="flex items-center justify-center w-10 h-10 rounded-md bg-primary">
              <Clock className="w-6 h-6 text-white" />
            </span>
            <span className="text-xl font-bold">ReQurr</span>
          </Link>
          {/* {isMobile && (
            <button
              type="button"
              className="p-2 rounded-md lg:hidden"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-6 h-6" />
            </button>
          )} */}
          {isMobile && (
            <button
              type="button"
              className="p-2 rounded-md z-50"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-6 h-6" />
            </button>
          )}

        </div>

        <nav className="flex-1 overflow-auto">
          <ul className="p-2 overflow-hidden">
            {navItems.map((item) => {
              const isActive = location === item.path ||
                (item.path === "/dashboard" && location === "/");
              const Icon = item.icon;

              return (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    className={`flex items-center p-2 space-x-2 rounded-md ${isActive
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "hover:bg-blue-50 hover:text-blue-700"
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex-shrink-0 p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <Users className="w-5 h-5 text-gray-500" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">Prasad Andure</p>
              <p className="text-xs text-gray-500 truncate">Prasad@coinage.in</p>
            </div>
            <LogoutButton />
          </div>
        </div>
      </aside>
    </>
  );
}
