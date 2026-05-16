import { Link } from "react-router-dom";
import {
  Package, ClipboardList, MessageSquare, Users,
  Search, BookOpen, ArrowRight, BarChart3,
} from "lucide-react";
import { useApp } from "@/context/AppContext";

const features = [
  { icon: Package,       title: "Equipment Inventory",  desc: "Browse all available lab equipment with real-time availability and condition status.",       to: "/inventory" },
  { icon: ClipboardList, title: "Issue Requests",       desc: "Submit requests with project details. Routes automatically through Faculty → Lab Assistant.",   to: "/request" },
  { icon: MessageSquare, title: "Secure Messages",      desc: "Communicate with lab assistants for collection details. 50-word message limit.",                to: "/messages" },
  { icon: Users,         title: "Team Projects",        desc: "Professors create group projects with unique Team IDs for collective equipment issuance.",       to: "/teams" },
  { icon: Search,        title: "Fault Scan",           desc: "Pre and post-issue scanning ensures equipment quality and transparent accountability records.",   to: "/fault-scan" },
  { icon: BookOpen,      title: "Usage Guidelines",     desc: "Read all policies on borrowing, returns, care, and team project equipment management.",          to: "/guidelines" },
];

const stats = [
  { value: "24+", label: "Hardware Items" },
  { value: "6",   label: "Categories" },
  { value: "100%", label: "Logged Transactions" },
  { value: "4",   label: "Lab Locations" },
];

export default function Home() {
  const { role } = useApp();

  return (
    <>
      {/* Hero */}
      <section className="relative gradient-hero hero-dot-pattern text-white py-24 overflow-hidden">
        <div className="container relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 rounded-full px-4 py-1.5 text-xs font-medium mb-6">
            🎓 Academic Equipment Management Platform
          </div>
          <h1 className="font-display text-5xl md:text-6xl font-extrabold mb-5 leading-tight">
            Equipra
          </h1>
          <p className="text-white/80 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            An Academic Platform for Transparent Access to Laboratory Resources.
            Enabling universities to digitally organize, monitor, and coordinate
            equipment for academic excellence.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              to="/inventory"
              className="flex items-center gap-2 bg-white text-primary font-bold px-6 py-3 rounded-xl text-sm hover:-translate-y-0.5 hover:shadow-xl transition-all"
            >
              <Package className="h-4 w-4" />
              View Inventory
            </Link>
            {role === "student" && (
              <Link
                to="/request"
                className="flex items-center gap-2 bg-white/15 border border-white/30 text-white font-semibold px-6 py-3 rounded-xl text-sm hover:bg-white/25 transition-colors"
              >
                <ClipboardList className="h-4 w-4" />
                Request Equipment
              </Link>
            )}
            {role === "admin" && (
              <Link
                to="/admin"
                className="flex items-center gap-2 bg-white/15 border border-white/30 text-white font-semibold px-6 py-3 rounded-xl text-sm hover:bg-white/25 transition-colors"
              >
                <BarChart3 className="h-4 w-4" />
                Admin Dashboard
              </Link>
            )}
            {role === "faculty" && (
              <Link
                to="/faculty"
                className="flex items-center gap-2 bg-white/15 border border-white/30 text-white font-semibold px-6 py-3 rounded-xl text-sm hover:bg-white/25 transition-colors"
              >
                <BarChart3 className="h-4 w-4" />
                Faculty Dashboard
              </Link>
            )}
            <Link
              to="/guidelines"
              className="flex items-center gap-2 bg-white/15 border border-white/30 text-white font-semibold px-6 py-3 rounded-xl text-sm hover:bg-white/25 transition-colors"
            >
              <BookOpen className="h-4 w-4" />
              Guidelines
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <div className="bg-card border-b border-border">
        <div className="container grid grid-cols-2 md:grid-cols-4 divide-x divide-border py-0">
          {stats.map(s => (
            <div key={s.label} className="text-center py-6">
              <div className="font-display text-3xl font-bold text-primary">{s.value}</div>
              <div className="text-xs text-muted-foreground font-medium mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-foreground mb-3">Platform Features</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Everything you need for seamless lab equipment management in one place.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {features.map(({ icon: Icon, title, desc, to }, i) => (
              <Link
                key={title}
                to={to}
                className="group bg-card border border-border/60 rounded-xl p-6 hover:border-primary/40 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                <div className="flex items-center gap-1 mt-4 text-xs font-medium text-primary group-hover:text-accent transition-colors">
                  Learn more <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="py-16 bg-muted/30 border-y border-border">
        <div className="container max-w-3xl text-center">
          <h2 className="font-display text-2xl font-bold text-foreground mb-4">About Equipra</h2>
          <p className="text-muted-foreground leading-relaxed">
            Equipra is a general-purpose academic platform designed to help universities and departments
            manage access to laboratory equipment for student projects, research, and innovation.
            It is not a commercial marketplace — all policies and control remain with the institution.
          </p>
        </div>
      </section>
    </>
  );
}
