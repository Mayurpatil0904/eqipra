import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import {
  Cpu,
  Menu,
  X,
  Sun,
  Moon,
  LogOut,
  Bell,
  UserCircle,
  ChevronDown,
} from "lucide-react";

import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";

const studentLinks = [
  { to: "/", label: "Home" },
  { to: "/inventory", label: "Inventory" },
  { to: "/request", label: "Request" },
  { to: "/my-requests", label: "My Requests" },
  { to: "/messages", label: "Messages" },
  { to: "/teams", label: "Teams" },
  { to: "/fault-scan", label: "Fault Scan" },
  { to: "/guidelines", label: "Guidelines" },
];

const facultyLinks = [
  { to: "/", label: "Home" },
  { to: "/faculty", label: "Dashboard" },

  { to: "/inventory", label: "Inventory" },

  // NEW
  { to: "/request", label: "Request" },
  { to: "/my-requests", label: "My Requests" },

  { to: "/messages", label: "Messages" },
  { to: "/teams", label: "Teams" },
  { to: "/guidelines", label: "Guidelines" },
];

const adminLinks = [
  { to: "/", label: "Home" },
  { to: "/admin", label: "Dashboard" },
  { to: "/inventory", label: "Inventory" },
  { to: "/messages", label: "Messages" },
  { to: "/guidelines", label: "Guidelines" },
];

export function Header() {
  const {
    user,
    role,
    theme,
    toggleTheme,
    logout,
    feedbacks,
  } = useApp();

  const location = useLocation();

  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const [userMenuOpen, setUserMenuOpen] =
    useState(false);

  const links =
    role === "admin"
      ? adminLinks
      : role === "faculty"
      ? facultyLinks
      : studentLinks;

  const unreadFeedback = feedbacks.filter(
    (f) => !f.read
  ).length;

  const initials =
    user?.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "?";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container flex h-16 items-center justify-between gap-4">

        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 group flex-shrink-0"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-transform group-hover:scale-105">
            <Cpu className="h-5 w-5" />
          </div>

          <div className="hidden sm:block">
            <div className="font-display font-bold text-lg text-foreground leading-none">
              Equipra
            </div>

            <div className="text-[10px] text-muted-foreground leading-tight mt-0.5">
              {user?.college ?? "Academic Platform"}
            </div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-0.5 flex-1 justify-center">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                "px-3.5 py-2 rounded-md text-sm font-medium transition-colors",

                location.pathname === link.to
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-2">

          {/* Theme */}
          <button
            onClick={toggleTheme}
            className="h-9 w-9 rounded-lg border border-border bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title={
              theme === "dark"
                ? "Light mode"
                : "Dark mode"
            }
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>

          {/* Feedback Bell */}
          {role === "admin" &&
            unreadFeedback > 0 && (
              <Link
                to="/admin"
                className="relative h-9 w-9 rounded-lg border border-border bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <Bell className="h-4 w-4" />

                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-status-fault text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadFeedback}
                </span>
              </Link>
            )}

          {/* User Dropdown */}
          <div className="hidden sm:block relative">
            <button
              onClick={() =>
                setUserMenuOpen((o) => !o)
              }
              className="flex items-center gap-2 pl-2 border-l border-border hover:opacity-80 transition-opacity"
            >
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                {initials}
              </div>

              <div className="hidden md:block text-left">
                <div className="text-sm font-semibold text-foreground leading-none">
                  {user?.name}
                </div>

                <div className="text-[10px] text-muted-foreground capitalize mt-0.5">
                  {role}
                </div>
              </div>

              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 text-muted-foreground transition-transform",
                  userMenuOpen && "rotate-180"
                )}
              />
            </button>

            {userMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() =>
                    setUserMenuOpen(false)
                  }
                />

                <div className="absolute right-0 top-full mt-2 w-52 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden animate-fade-in">

                  <div className="px-4 py-3 border-b border-border bg-muted/30">
                    <p className="text-sm font-semibold text-foreground">
                      {user?.name}
                    </p>

                    <p className="text-xs text-muted-foreground mt-0.5">
                      {user?.department}
                    </p>
                  </div>

                  <div className="p-1.5">

                    <Link
                      to="/profile"
                      onClick={() =>
                        setUserMenuOpen(false)
                      }
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-foreground hover:bg-muted transition-colors"
                    >
                      <UserCircle className="h-4 w-4 text-muted-foreground" />
                      My Profile & Password
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-status-fault hover:bg-status-fault/10 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Log Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            className="lg:hidden h-9 w-9 rounded-lg border border-border bg-muted/50 flex items-center justify-center"
            onClick={() =>
              setMobileOpen((o) => !o)
            }
          >
            {mobileOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <nav className="lg:hidden border-t border-border bg-card p-4 animate-fade-in">

          <div className="flex flex-col gap-1">

            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() =>
                  setMobileOpen(false)
                }
                className={cn(
                  "px-4 py-3 rounded-md text-sm font-medium transition-colors",

                  location.pathname === link.to
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {link.label}
              </Link>
            ))}

            <Link
              to="/profile"
              onClick={() =>
                setMobileOpen(false)
              }
              className="px-4 py-3 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted flex items-center gap-2"
            >
              <UserCircle className="h-4 w-4" />
              My Profile
            </Link>

            <button
              onClick={handleLogout}
              className="px-4 py-3 rounded-md text-sm font-medium text-status-fault hover:bg-status-fault/10 text-left flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Log Out
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}