import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
  Cpu,
  CheckCircle2,
  Users,
  MessageSquare,
  LayoutDashboard,
  Loader2,
} from "lucide-react";

import { useApp } from "@/context/AppContext";

import { colleges as fallbackColleges } from "@/data/hardwareData";

import { authApi } from "@/lib/api";

import { toast } from "sonner";

import { cn } from "@/lib/utils";

type RoleOption =
  | "student"
  | "faculty"
  | "admin";

const roleCards: {
  role: RoleOption;
  emoji: string;
  label: string;
}[] = [
  {
    role: "student",
    emoji: "🎓",
    label: "Student",
  },

  {
    role: "faculty",
    emoji: "👨‍🏫",
    label: "Faculty",
  },

  {
    role: "admin",
    emoji: "🛡️",
    label: "Admin / Lab",
  },
];

export default function Login() {
  const { login } = useApp();

  const navigate = useNavigate();

  const [college, setCollege] =
    useState("");

  const [enrollmentId, setEnrollmentId] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [selectedRole, setSelectedRole] =
    useState<RoleOption>("student");

  const [submitting, setSubmitting] =
    useState(false);

  const [collegeList, setCollegeList] =
    useState<string[]>(fallbackColleges);

  useEffect(() => {
    authApi.colleges()
      .then((data) => {
        const names = data.map((c: any) => c.name).filter(Boolean);
        if (names.length > 0) setCollegeList(names);
      })
      .catch(() => {}); // fallback to hardcoded list
  }, []);

  const handleLogin = async () => {

    if (!college) {
      toast.error(
        "Please select your college."
      );
      return;
    }

    if (!enrollmentId.trim()) {
      toast.error(
        "Please enter your enrollment / employee ID."
      );
      return;
    }

    if (!password) {
      toast.error(
        "Please enter your password."
      );
      return;
    }

    setSubmitting(true);

    try {

      await login(
        enrollmentId.trim(),
        password,
        college,

        // ✅ FIXED HERE
        selectedRole.toUpperCase()
      );

      toast.success(
        "Welcome back! 👋"
      );

      navigate(
        selectedRole === "admin"
          ? "/admin"
          : selectedRole === "faculty"
          ? "/faculty"
          : "/"
      );

    } catch (err: any) {

      toast.error(
        err.message ??
        "Login failed. Check your credentials."
      );

    } finally {

      setSubmitting(false);

    }
  };

  return (
    <div className="flex min-h-screen">

      {/* LEFT PANEL */}
      <div className="hidden lg:flex flex-col justify-between flex-1 login-panel-left hero-dot-pattern gradient-hero p-14 text-white relative overflow-hidden">

        <div className="relative z-10">

          {/* LOGO */}
          <div className="flex items-center gap-3 mb-12">

            <div className="h-12 w-12 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/10">
              <Cpu className="h-6 w-6 text-white" />
            </div>

            <div>
              <div className="font-display text-2xl font-bold text-white">
                Equipra
              </div>

              <div className="text-white/90 text-xs mt-0.5 tracking-wide">
                Academic Lab Management
              </div>
            </div>
          </div>

          {/* HERO TEXT */}
          <h1 className="font-display text-5xl font-extrabold leading-tight mb-5 text-white">
            Transparent Access
            <br />
            to Lab Resources
          </h1>

          <p className="text-white/95 text-base leading-relaxed max-w-sm">
            Digitally manage, track and
            coordinate laboratory
            equipment for academic
            projects — with full
            accountability and audit
            trails.
          </p>
        </div>

        {/* FEATURES */}
        <div className="relative z-10 space-y-0">

          {[
            {
              icon: CheckCircle2,
              text: "Multi-stage approval workflow",
            },

            {
              icon: LayoutDashboard,
              text: "Real-time inventory dashboard",
            },

            {
              icon: Users,
              text: "Team project management",
            },

            {
              icon: MessageSquare,
              text: "Secure 50-word messaging",
            },
          ].map(
            ({ icon: Icon, text }) => (
              <div
                key={text}
                className="flex items-center gap-3 py-3 border-b border-white/10 last:border-0"
              >
                <div className="h-8 w-8 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border border-white/10">

                  <Icon className="h-4 w-4 text-white" />
                </div>

                <span className="text-sm text-white font-medium">
                  {text}
                </span>
              </div>
            )
          )}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 lg:max-w-xl xl:max-w-lg flex flex-col justify-center px-8 py-12 bg-background">

        <div className="max-w-sm mx-auto w-full">

          {/* TITLE */}
          <div className="mb-8">
            <h2 className="font-display text-3xl font-bold text-foreground mb-1">
              Welcome Back
            </h2>

            <p className="text-muted-foreground text-sm">
              Sign in to access
              laboratory resources
            </p>
          </div>

          {/* FORM */}
          <div className="space-y-4">

            {/* COLLEGE */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Select Your College
              </label>

              <select
                value={college}
                onChange={(e) =>
                  setCollege(
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm text-foreground"
              >
                <option value="">
                  — Choose College —
                </option>

                {collegeList.map((c) => (
                  <option key={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* ID */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Enrollment / Employee ID
              </label>

              <input
                type="text"
                value={enrollmentId}
                onChange={(e) =>
                  setEnrollmentId(
                    e.target.value
                  )
                }
                placeholder="e.g. PU-STU-001"
                className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm"
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  handleLogin()
                }
                placeholder="••••••••"
                className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm"
              />
            </div>

            {/* ROLE */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                You are a
              </label>

              <div className="grid grid-cols-3 gap-2.5">

                {roleCards.map(
                  ({
                    role,
                    emoji,
                    label,
                  }) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() =>
                        setSelectedRole(
                          role
                        )
                      }
                      className={cn(
                        "flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-center",

                        selectedRole ===
                          role
                          ? "border-primary bg-primary/8 text-primary"
                          : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:bg-muted/50"
                      )}
                    >
                      <span className="text-xl">
                        {emoji}
                      </span>

                      <span className="text-xs font-semibold">
                        {label}
                      </span>
                    </button>
                  )
                )}
              </div>
            </div>

            {/* LOGIN BUTTON */}
            <button
              onClick={handleLogin}
              disabled={submitting}
              className="w-full mt-2 bg-primary text-primary-foreground rounded-xl py-3 font-semibold text-sm hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign In →"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
