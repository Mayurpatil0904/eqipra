import { Link } from "react-router-dom";
import { MapPin, Calendar, ArrowRight } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { useApp } from "@/context/AppContext";

interface Props {
  item: any; // accepts both hardwareData shape and DB shape
}

export function HardwareCard({ item }: Props) {
  const { role } = useApp();
  // DB uses `slug` as the URL key; legacy hardwareData uses `id`
  const urlKey = item.slug ?? item.id;

  return (
    <Link to={`/hardware/${urlKey}`} className="group block h-full">
      <div className="h-full flex flex-col bg-card rounded-lg border border-border/60 overflow-hidden shadow-card transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/40">

        {/* Emoji thumbnail */}
        <div className="h-44 flex items-center justify-center bg-muted/30 text-6xl transition-transform duration-300 group-hover:scale-105 select-none">
          {item.emoji ?? "📦"}
        </div>

        <div className="flex flex-col flex-1 p-5 gap-3">
          <div>
            <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-1">
              {item.category}
            </p>
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
              {item.name}
            </h3>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <StatusBadge type="availability" status={item.availabilityStatus} />
            {item.faultScanStatus && <StatusBadge type="fault" status={item.faultScanStatus} />}
          </div>

          <div className="space-y-1.5 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{item.labLocation}</span>
            </div>
            {item.returnDate && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                <span>Return: {item.returnDate}</span>
              </div>
            )}
            {item.lastIssuedTo && (
              <div className="text-xs font-mono truncate">
                Issued to: {item.lastIssuedTo}
              </div>
            )}
          </div>

          {item.conditionLog && (
            <p className="text-xs text-muted-foreground line-clamp-2 border-t border-border/50 pt-3 mt-auto">
              {item.conditionLog}
            </p>
          )}

          {/* Issue button shown directly on card for students */}
          {role === "student" && item.availabilityStatus === "available" && (
            <Link
              to={`/request?item=${urlKey}`}
              onClick={e => e.stopPropagation()}
              className="mt-1 inline-flex items-center justify-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors"
            >
              Issue Equipment →
            </Link>
          )}

          <div className="flex items-center text-xs font-medium text-primary group-hover:text-accent transition-colors gap-1 mt-auto">
            View Details
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </Link>
  );
}
