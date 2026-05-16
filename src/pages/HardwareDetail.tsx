import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, User, Calendar, CheckCircle2 } from "lucide-react";
import { hardwareData } from "@/data/hardwareData";
import { StatusBadge } from "@/components/StatusBadge";
import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";

const dotCls: Record<string, string> = {
  success: "bg-status-available",
  pending: "bg-status-pending",
  warning: "bg-status-issued",
  error:   "bg-status-fault",
};

export default function HardwareDetail() {
  const { id }       = useParams<{ id: string }>();
  const { role }     = useApp();
  const navigate     = useNavigate();
  const item         = hardwareData.find(h => h.id === id);

  if (!item) return (
    <div className="container py-20 text-center">
      <h1 className="font-display text-2xl font-bold mb-4">Hardware Not Found</h1>
      <p className="text-muted-foreground mb-6">The item you're looking for doesn't exist.</p>
      <Link to="/inventory" className="text-primary font-medium hover:underline flex items-center gap-1 justify-center">
        <ArrowLeft className="h-4 w-4" /> Back to Inventory
      </Link>
    </div>
  );

  return (
    <div className="container py-8 max-w-5xl">
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 border-none bg-none">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
        {/* Left */}
        <div className="space-y-4">
          <div className="aspect-square rounded-xl bg-muted/30 border border-border flex items-center justify-center text-7xl select-none">
            {item.emoji}
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Typical Uses</p>
            <div className="space-y-2">
              {item.typicalUses.map(u => (
                <div key={u} className="flex items-center gap-2 text-sm text-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5 text-status-available flex-shrink-0" />
                  {u}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right */}
        <div>
          <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-2">{item.category}</p>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">{item.name}</h1>

          <div className="flex flex-wrap gap-2 mb-5">
            <StatusBadge type="availability" status={item.availabilityStatus} />
            <StatusBadge type="fault"        status={item.faultScanStatus} />
          </div>

          <p className="text-muted-foreground leading-relaxed mb-6">{item.description}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground">Location:</span>
              <span className="font-medium text-foreground">{item.labLocation}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground">Supervisor:</span>
              <span className="font-medium text-foreground">{item.supervisor}</span>
            </div>
            {item.lastIssuedTo && (
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground">Issued to:</span>
                <span className="font-mono text-xs text-foreground">{item.lastIssuedTo}</span>
              </div>
            )}
            {item.returnDate && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground">Return:</span>
                <span className="font-medium text-foreground">{item.returnDate}</span>
              </div>
            )}
          </div>

          <div className="bg-muted/50 rounded-lg px-4 py-3 text-sm text-muted-foreground mb-6">
            <span className="font-semibold text-foreground">Condition: </span>{item.conditionLog}
          </div>

          {/* Request button — only for students */}
          {role === "student" && (
            <Link to={`/request?item=${item.id}`}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors mb-6">
              {item.availabilityStatus === "available" ? "Request This Equipment →" : "Submit Request for Future Dates →"}
            </Link>
          )}

          {/* Timeline */}
          <div>
            <p className="font-semibold text-foreground mb-4 text-sm">Usage Timeline</p>
            <div className="space-y-0">
              {item.timeline.map((entry, i) => (
                <div key={i} className="flex gap-4 pb-4 last:pb-0 relative">
                  {i < item.timeline.length - 1 && (
                    <div className="absolute left-3 top-6 w-0.5 h-full bg-border" />
                  )}
                  <div className={cn("w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center z-10 mt-0.5", dotCls[entry.status] ?? "bg-muted")}>
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                  <div>
                    <p className="text-sm text-foreground">{entry.description}</p>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">{entry.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
