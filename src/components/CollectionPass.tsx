import { useState, useEffect, useRef } from "react";
import {
  CheckCircle2,
  MapPin,
  Calendar,
  Clock,
  User,
  Package,
  Hash,
  ChevronDown,
  ChevronUp,
  Printer,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  request: any;
}

function Detail({
  icon: Icon,
  label,
  value,
  highlight,
  full,
}: {
  icon: any;
  label: string;
  value: string;
  highlight?: boolean;
  full?: boolean;
}) {
  return (
    <div className={cn("flex flex-col gap-0.5", full && "col-span-2")}>
      <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
        <Icon className="h-3 w-3" />
        {label}
      </div>

      <p
        className={cn(
          "text-sm font-medium",
          highlight
            ? "text-primary font-bold"
            : "text-foreground"
        )}
      >
        {value}
      </p>
    </div>
  );
}

// Generate QR code as data URL using Canvas API (no external package needed)
async function generateQrDataUrl(text: string): Promise<string> {
  // Use a simple QR code via a public API as fallback
  // Encode the text as a QR code image URL
  const size = 200;
  const encoded = encodeURIComponent(text);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&format=png`;
}

export function CollectionPass({ request }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [qrUrl, setQrUrl] = useState<string>("");
  const passRef = useRef<HTMLDivElement>(null);

  if (!request) return null;

  if (request.status !== "approved") return null;

  const equipment = request.equipment ?? {};
  const student = request.student ?? {};
  const faculty = request.faculty ?? {};
  const messages = request.messages ?? [];

  const labMessage = [...messages]
    .reverse()
    .find((m: any) => m.sender === "lab");

  const fromDate = request.dateFrom
    ? new Date(request.dateFrom).toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "N/A";

  const toDate = request.dateTo
    ? new Date(request.dateTo).toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "N/A";

  // Generate QR code when expanded and qrToken available
  useEffect(() => {
    if (expanded && request.qrToken && !qrUrl) {
      const scanUrl = `${window.location.origin}/scan/${request.qrToken}`;
      generateQrDataUrl(scanUrl).then(setQrUrl);
    }
  }, [expanded, request.qrToken]);

  // Print only the collection pass
  const handlePrint = () => {
    const passEl = passRef.current;
    if (!passEl) { window.print(); return; }

    const printWindow = window.open("", "_blank", "width=600,height=800");
    if (!printWindow) { window.print(); return; }

    printWindow.document.write(`
      <html>
      <head>
        <title>Collection Pass - ${request.requestCode ?? request.id.slice(0,8)}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 20px; color: #1a1a1a; }
          .pass { border: 2px solid #22c55e; border-radius: 12px; overflow: hidden; max-width: 500px; margin: 0 auto; }
          .header { background: #2563eb; color: white; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; }
          .header-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; opacity: 0.7; }
          .header-main { font-size: 18px; font-weight: 700; margin-top: 4px; }
          .emoji { font-size: 36px; }
          .body { padding: 16px 20px; }
          .code-row { background: #f5f5f5; border-radius: 8px; padding: 12px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
          .code-label { font-size: 12px; color: #666; }
          .code-value { font-size: 18px; font-weight: 700; font-family: monospace; letter-spacing: 2px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
          .detail-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #666; font-weight: 600; margin-bottom: 2px; }
          .detail-value { font-size: 13px; font-weight: 500; }
          .full { grid-column: span 2; }
          .qr-section { text-align: center; padding: 16px; border-top: 1px solid #eee; }
          .qr-section img { width: 150px; height: 150px; margin: 0 auto; }
          .qr-label { font-size: 10px; color: #666; margin-top: 8px; }
          .footer { font-size: 9px; color: #999; text-align: center; border-top: 1px solid #eee; padding: 12px; }
          .instructions { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 12px; margin-bottom: 16px; }
          .instructions-label { font-size: 10px; color: #2563eb; font-weight: 700; text-transform: uppercase; margin-bottom: 6px; }
          .instructions-text { font-size: 13px; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="pass">
          <div class="header">
            <div>
              <div class="header-title">Equipra · Collection Pass</div>
              <div class="header-main">Equipment Approved ✓</div>
            </div>
            <div class="emoji">${equipment.emoji ?? "📦"}</div>
          </div>
          <div class="body">
            <div class="code-row">
              <span class="code-label"># Request Code</span>
              <span class="code-value">${request.requestCode ?? "N/A"}</span>
            </div>
            <div class="grid">
              <div><div class="detail-label">Equipment</div><div class="detail-value">${equipment.name ?? "Equipment"}</div></div>
              <div><div class="detail-label">Lab Location</div><div class="detail-value" style="color:#2563eb;font-weight:700">${equipment.labLocation ?? "Lab"}</div></div>
              <div><div class="detail-label">From</div><div class="detail-value">${fromDate}</div></div>
              <div><div class="detail-label">Return By</div><div class="detail-value" style="color:#2563eb;font-weight:700">${toDate}</div></div>
              <div><div class="detail-label">Student</div><div class="detail-value">${student.name ? `${student.name} · ${student.enrollmentId ?? ""}` : "Student"}</div></div>
              <div><div class="detail-label">Verified By</div><div class="detail-value">${faculty.name ?? "Faculty"}</div></div>
              <div class="full"><div class="detail-label">Project</div><div class="detail-value">${request.project ?? "N/A"}</div></div>
            </div>
            ${labMessage ? `<div class="instructions"><div class="instructions-label">Collection Instructions</div><div class="instructions-text">${labMessage.text}</div></div>` : ""}
            ${qrUrl ? `<div class="qr-section"><img src="${qrUrl}" alt="QR Code" /><div class="qr-label">Scan to verify · ${request.requestCode ?? ""}</div></div>` : ""}
          </div>
          <div class="footer">Present this pass at the lab counter. Equipment must be returned by ${toDate}.</div>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
  };

  return (
    <div className="mt-4 rounded-xl border-2 border-status-available/40 bg-status-available/5 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left px-4 py-3.5 flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-2.5">
          <CheckCircle2 className="h-5 w-5 text-status-available flex-shrink-0" />

          <div>
            <p className="text-sm font-bold text-status-available">
              Collection Pass Ready
            </p>

            <p className="text-xs text-muted-foreground mt-0.5">
              Show this at the lab counter to collect your equipment
            </p>
          </div>
        </div>

        {expanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-status-available/20">
          <div ref={passRef} className="mx-4 my-4 bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="bg-primary px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-primary-foreground/70 uppercase tracking-widest">
                  Equipra · Collection Pass
                </p>

                <p className="text-white font-bold text-lg mt-0.5">
                  Equipment Approved ✓
                </p>
              </div>

              <div className="text-4xl">
                {equipment.emoji ?? "📦"}
              </div>
            </div>

            <div className="px-5 py-4 space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Hash className="h-4 w-4" />
                  Request Code
                </div>

                <span className="font-mono font-bold text-lg text-foreground tracking-wider">
                  {request.requestCode ?? "N/A"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Detail
                  icon={Package}
                  label="Equipment"
                  value={equipment.name ?? "Equipment"}
                />

                <Detail
                  icon={MapPin}
                  label="Lab Location"
                  value={equipment.labLocation ?? "Lab"}
                  highlight
                />

                <Detail
                  icon={Calendar}
                  label="From"
                  value={fromDate}
                />

                <Detail
                  icon={Calendar}
                  label="Return By"
                  value={toDate}
                  highlight
                />

                <Detail
                  icon={User}
                  label="Student"
                  value={
                    student.name
                      ? `${student.name} · ${student.enrollmentId ?? ""}`
                      : "Student"
                  }
                />

                <Detail
                  icon={User}
                  label="Verified By"
                  value={faculty.name ?? "Faculty"}
                />
              </div>

              <Detail
                icon={Package}
                label="Project"
                value={request.project ?? "N/A"}
                full
              />

              {/* QR Code */}
              {qrUrl && (
                <div className="flex flex-col items-center gap-2 p-4 bg-muted/30 rounded-xl border border-border">
                  <img src={qrUrl} alt="QR Code" className="w-36 h-36 rounded-lg" />
                  <p className="text-[10px] text-muted-foreground">
                    Scan to verify · {request.requestCode ?? ""}
                  </p>
                </div>
              )}

              {labMessage ? (
                <div className="p-3.5 bg-primary/8 border border-primary/20 rounded-xl">
                  <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Clock className="h-3 w-3" />
                    Collection Instructions from Lab Admin
                  </p>

                  <p className="text-sm text-foreground font-medium leading-relaxed">
                    {labMessage.text}
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-muted/50 rounded-xl text-xs text-muted-foreground">
                  No collection instructions available.
                </div>
              )}

              <p className="text-[10px] text-muted-foreground text-center border-t border-border/50 pt-3">
                Present this pass at the lab counter.
                Equipment must be returned by {toDate}.
              </p>
            </div>
          </div>

          <div className="px-4 pb-4">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground border border-border rounded-lg px-3 py-2 hover:bg-muted transition-colors"
            >
              <Printer className="h-3.5 w-3.5" />
              Print Pass
            </button>
          </div>
        </div>
      )}
    </div>
  );
}