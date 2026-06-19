import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AppProvider, useApp } from "@/context/AppContext";
import { Toaster } from "sonner";
import { Loader2 } from "lucide-react";

import { MainLayout } from "@/components/layout/MainLayout";

import Login from "@/pages/Login";
import Home from "@/pages/Home";
import Inventory from "@/pages/Inventory";
import HardwareDetail from "@/pages/HardwareDetail";
import RequestIssue from "@/pages/RequestIssue";
import MyRequests from "@/pages/MyRequests";
import Messages from "@/pages/Messages";
import Teams from "@/pages/Teams";
import FaultScan from "@/pages/FaultScan";
import Guidelines from "@/pages/Guidelines";
import AdminDashboard from "@/pages/AdminDashboard";
import FacultyDashboard from "@/pages/FacultyDashboard";
import Profile from "@/pages/Profile";
import ScanRedirect from "@/pages/ScanRedirect";
import NotFound from "@/pages/NotFound";

function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
      <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center">
        <Loader2 className="h-7 w-7 text-primary-foreground animate-spin" />
      </div>

      <p className="text-muted-foreground text-sm font-medium">
        Loading Equipra…
      </p>
    </div>
  );
}

function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: string[];
}) {
  const { role, loading } = useApp();
  const location = useLocation();

  if (loading) return <LoadingScreen />;

  if (!role) {
    // ✅ Pass the intended destination as BOTH location.state AND a ?from=
    // query param. location.state only works for in-app navigation; the
    // query param survives when a phone camera opens the URL in a fresh tab.
    const fromPath = location.pathname + location.search;
    return (
      <Navigate
        to={`/login?from=${encodeURIComponent(fromPath)}`}
        state={{ from: location }}
        replace
      />
    );
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { role, loading } = useApp();

  if (loading) return <LoadingScreen />;

  return (
    <Routes>
      <Route
        path="/login"
        element={
          role ? (
            <Navigate
              to={
                role === "admin"
                  ? "/admin"
                  : role === "faculty"
                  ? "/faculty"
                  : "/"
              }
              replace
            />
          ) : (
            <Login />
          )
        }
      />

      <Route
        element={
          <ProtectedRoute
            allowedRoles={["student", "faculty", "admin"]}
          >
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Home />} />

        <Route path="/inventory" element={<Inventory />} />

        <Route
          path="/hardware/:id"
          element={<HardwareDetail />}
        />

        <Route path="/fault-scan" element={<FaultScan />} />

        <Route path="/guidelines" element={<Guidelines />} />

        <Route path="/messages" element={<Messages />} />

        <Route path="/teams" element={<Teams />} />

        <Route path="/profile" element={<Profile />} />

        {/* ✅ NEW — Collection-pass QR code lands here */}
        <Route path="/scan/:token" element={<ScanRedirect />} />

        {/* REQUEST ROUTES */}
        <Route
          path="/request"
          element={
            <ProtectedRoute
              allowedRoles={["student", "faculty"]}
            >
              <RequestIssue />
            </ProtectedRoute>
          }
        />

        <Route
          path="/request/:id"
          element={
            <ProtectedRoute
              allowedRoles={["student", "faculty"]}
            >
              <RequestIssue />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-requests"
          element={
            <ProtectedRoute
              allowedRoles={["student", "faculty"]}
            >
              <MyRequests />
            </ProtectedRoute>
          }
        />

        {/* FACULTY */}
        <Route
          path="/faculty"
          element={
            <ProtectedRoute allowedRoles={["faculty"]}>
              <FacultyDashboard />
            </ProtectedRoute>
          }
        />

        {/* ADMIN */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />

        <Toaster
          richColors
          position="bottom-right"
          closeButton
        />
      </BrowserRouter>
    </AppProvider>
  );
}