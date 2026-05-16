import { useState, useEffect } from "react";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  Package,
  FileText,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Users,
  User,
  Loader2,
} from "lucide-react";

import { useApp } from "@/context/AppContext";

import { hardwareData } from "@/data/hardwareData";

import { professorsApi } from "@/lib/api";

import {
  daysBetween,
  todayStr,
  addDays,
  cn,
} from "@/lib/utils";

import { toast } from "sonner";

type ReqType = "individual" | "team";

export default function RequestIssue() {
  const { user, teams, addRequest, role } = useApp();

  const navigate = useNavigate();

  const [params] = useSearchParams();

  const [itemId, setItemId] = useState(
    params.get("item") ?? ""
  );

  const [reqType, setReqType] =
    useState<ReqType>("individual");

  const [teamCode, setTeamCode] =
    useState("");

  const [project, setProject] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [profId, setProfId] =
    useState("");

  const [purpose, setPurpose] =
    useState("");

  const [dateFrom, setDateFrom] =
    useState(addDays(todayStr(), 1));

  const [dateTo, setDateTo] =
    useState(addDays(todayStr(), 8));

  const [submitting, setSubmitting] =
    useState(false);

  const [professors, setProfessors] =
    useState<
      {
        id: string;
        name: string;
        department: string;
      }[]
    >([]);

  const [loadingProfs, setLoadingProfs] =
    useState(true);

  const myActiveTeam = teams.find(
    (t) =>
      t.active &&
      t.members.some((m) => m.id === user?.id)
  );

  const selectedItem = hardwareData.find(
    (h) => h.id === itemId
  );

  const days =
    dateFrom && dateTo
      ? daysBetween(dateFrom, dateTo)
      : 0;

  const datesValid =
    days >= 1 && days <= 14;

  // FETCH PROFESSORS
  useEffect(() => {
    professorsApi
      .list()
      .then(setProfessors)
      .catch(() => {})
      .finally(() =>
        setLoadingProfs(false)
      );
  }, []);

  // AUTO TEAM CODE
  useEffect(() => {
    if (
      reqType === "team" &&
      myActiveTeam
    ) {
      setTeamCode(myActiveTeam.id);
    }
  }, [reqType, myActiveTeam]);

  const handleSubmit = async () => {
    if (!itemId) {
      toast.error(
        "Please select an equipment item."
      );
      return;
    }

    if (!project.trim()) {
      toast.error(
        "Please enter a project title."
      );
      return;
    }

    if (!description.trim()) {
      toast.error(
        "Please enter a project description."
      );
      return;
    }

    // FACULTY BYPASS
    if (
      role !== "faculty" &&
      !profId
    ) {
      toast.error(
        "Please select a professor."
      );
      return;
    }

    if (!purpose.trim()) {
      toast.error(
        "Please enter a purpose / justification."
      );
      return;
    }

    if (!datesValid) {
      toast.error(
        "Borrowing period must be 1–14 days."
      );
      return;
    }

    if (
      reqType === "team" &&
      !teamCode.trim()
    ) {
      toast.error(
        "Please enter your Team ID."
      );
      return;
    }

    setSubmitting(true);

    try {
      await addRequest({
        equipmentSlug: itemId,

        project: project.trim(),

        description:
          description.trim(),

        purpose: purpose.trim(),

        professorId: profId,

        dateFrom,

        dateTo,

        type: reqType,

        ...(reqType === "team"
          ? {
              teamCode:
                teamCode.trim(),
            }
          : {}),
      });

      toast.success(
        role === "faculty"
          ? "Faculty request submitted to Lab Assistant!"
          : "Request submitted! Forwarded to professor for verification."
      );

      navigate("/my-requests");
    } catch (err: any) {
      toast.error(
        err.message ??
          "Failed to submit request."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const steps =
    role === "faculty"
      ? [
          {
            label: "Submit",
            done: true,
            active: false,
          },
          {
            label: "Lab Assistant",
            done: false,
            active: true,
          },
          {
            label: "Approval",
            done: false,
            active: false,
          },
        ]
      : [
          {
            label: "Submit",
            done: true,
            active: false,
          },
          {
            label: "Faculty",
            done: false,
            active: true,
          },
          {
            label: "Lab Assistant",
            done: false,
            active: false,
          },
          {
            label: "Approval",
            done: false,
            active: false,
          },
        ];

  return (
    <>
      <section className="bg-muted/30 border-b border-border py-10">
        <div className="container">

          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            Request Equipment
          </h1>

          <p className="text-muted-foreground">
            {role === "faculty" ? (
              <>
                Your request routes:
                <strong className="text-foreground">
                  {" "}
                  You → Lab Assistant →
                  Approved
                </strong>
              </>
            ) : (
              <>
                Your request routes:
                <strong className="text-foreground">
                  {" "}
                  You → Faculty →
                  Lab Assistant →
                  Approved
                </strong>
              </>
            )}
          </p>

          <div className="flex items-center gap-0 mt-6 max-w-lg">

            {steps.map((s, i) => (
              <div
                key={s.label}
                className="flex items-center gap-0"
              >
                <div
                  className={cn(
                    "workflow-step",
                    s.done && "done",
                    s.active && "active"
                  )}
                >
                  <div className="workflow-step-circle">
                    {s.done ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      i + 1
                    )}
                  </div>

                  <span className="hidden sm:inline whitespace-nowrap">
                    {s.label}
                  </span>
                </div>

                {i <
                  steps.length - 1 && (
                  <div
                    className={cn(
                      "workflow-step-line",
                      s.done && "done"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="container py-8 max-w-2xl">

        {/* TEAM LOCK */}
        {myActiveTeam &&
          role !== "faculty" && (
            <div className="mb-6 p-4 bg-status-pending/10 border border-status-pending/30 rounded-xl text-sm text-status-pending flex items-start gap-3">

              <Users className="h-4 w-4 flex-shrink-0 mt-0.5" />

              <div>
                You are part of active team{" "}
                <strong>
                  {myActiveTeam.id}
                </strong>{" "}
                ({myActiveTeam.name}).
                Individual ID is locked.
                Use Team ID for all
                requests while this
                project is active.
              </div>
            </div>
          )}

        {/* EQUIPMENT */}
        <div className="bg-card border border-border rounded-xl p-6 mb-5">

          <h2 className="font-semibold text-foreground flex items-center gap-2 mb-5">
            <Package className="h-4 w-4 text-primary" />
            Equipment Selection
          </h2>

          <div className="space-y-4">

            {/* SELECT */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Select Equipment *
              </label>

              <select
                value={itemId}
                onChange={(e) =>
                  setItemId(
                    e.target.value
                  )
                }
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm"
              >
                <option value="">
                  — Choose Equipment —
                </option>

                {hardwareData.map((h) => (
                  <option
                    key={h.id}
                    value={h.id}
                  >
                    {h.emoji} {h.name} (
                    {h.labLocation})
                  </option>
                ))}
              </select>

              {selectedItem && (
                <div
                  className={cn(
                    "mt-2 p-3 rounded-lg text-xs flex items-start gap-2",

                    selectedItem.availabilityStatus ===
                      "available"
                      ? "bg-status-available/10 border border-status-available/25 text-status-available"
                      : "bg-status-issued/10 border border-status-issued/25 text-status-issued"
                  )}
                >
                  {selectedItem.availabilityStatus ===
                  "available" ? (
                    <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                  )}

                  <span>
                    {selectedItem.availabilityStatus ===
                    "available"
                      ? `${selectedItem.name} is available at ${selectedItem.labLocation}`
                      : `${selectedItem.name} is currently ${selectedItem.availabilityStatus}.`}
                  </span>
                </div>
              )}
            </div>

            {/* REQUEST TYPE */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Request Type
              </label>

              <div className="grid grid-cols-2 gap-3">

                {(
                  [
                    "individual",
                    "team",
                  ] as ReqType[]
                ).map((t) => (
                  <button
                    key={t}
                    onClick={() =>
                      setReqType(t)
                    }
                    className={cn(
                      "flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 transition-all",

                      reqType === t
                        ? "border-primary bg-primary/8 text-primary"
                        : "border-border bg-card text-muted-foreground hover:border-primary/40"
                    )}
                  >
                    {t ===
                    "individual" ? (
                      <User className="h-5 w-5" />
                    ) : (
                      <Users className="h-5 w-5" />
                    )}

                    <span className="text-sm font-semibold capitalize">
                      {t}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* TEAM CODE */}
            {reqType === "team" && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Team ID *
                </label>

                <input
                  type="text"
                  value={teamCode}
                  onChange={(e) =>
                    setTeamCode(
                      e.target.value
                    )
                  }
                  placeholder="e.g. TEAM-PU-0042"
                  className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm font-mono"
                />
              </div>
            )}
          </div>
        </div>

        {/* PROJECT DETAILS */}
        <div className="bg-card border border-border rounded-xl p-6 mb-5">

          <h2 className="font-semibold text-foreground flex items-center gap-2 mb-5">
            <FileText className="h-4 w-4 text-primary" />
            Project Details
          </h2>

          <div className="space-y-4">

            {/* TITLE */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Project Title *
              </label>

              <input
                type="text"
                value={project}
                onChange={(e) =>
                  setProject(
                    e.target.value
                  )
                }
                placeholder="e.g. Smart Home Automation"
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm"
              />
            </div>

            {/* DESCRIPTION */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Project Description *
              </label>

              <textarea
                value={description}
                onChange={(e) =>
                  setDescription(
                    e.target.value
                  )
                }
                rows={3}
                placeholder="Describe your project..."
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm resize-y"
              />
            </div>

            {/* PROFESSOR */}
            {role !== "faculty" && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Forward to Professor *
                </label>

                {loadingProfs ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading professors…
                  </div>
                ) : (
                  <select
                    value={profId}
                    onChange={(e) =>
                      setProfId(
                        e.target.value
                      )
                    }
                    className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm"
                  >
                    <option value="">
                      — Select
                      Professor —
                    </option>

                    {professors.map(
                      (p) => (
                        <option
                          key={p.id}
                          value={p.id}
                        >
                          {p.name} (
                          {
                            p.department
                          }
                          )
                        </option>
                      )
                    )}
                  </select>
                )}

                <p className="text-xs text-muted-foreground mt-1">
                  Request goes to
                  this professor
                  first for
                  verification.
                </p>
              </div>
            )}

            {/* FACULTY NOTICE */}
            {role === "faculty" && (
              <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg text-sm">
                👨‍🏫 Faculty
                requests go
                directly to the
                Lab Assistant for
                approval.
              </div>
            )}

            {/* PURPOSE */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Purpose /
                Justification *
              </label>

              <textarea
                value={purpose}
                onChange={(e) =>
                  setPurpose(
                    e.target.value
                  )
                }
                rows={2}
                placeholder="Why do you need this equipment?"
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm resize-y"
              />
            </div>
          </div>
        </div>

        {/* DATES */}
        <div className="bg-card border border-border rounded-xl p-6 mb-6">

          <h2 className="font-semibold text-foreground flex items-center gap-2 mb-5">
            <Calendar className="h-4 w-4 text-primary" />
            Borrowing Period
          </h2>

          <div className="grid grid-cols-2 gap-4 mb-3">

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                From Date *
              </label>

              <input
                type="date"
                value={dateFrom}
                min={todayStr()}
                onChange={(e) =>
                  setDateFrom(
                    e.target.value
                  )
                }
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                To Date *
              </label>

              <input
                type="date"
                value={dateTo}
                min={
                  dateFrom ||
                  todayStr()
                }
                onChange={(e) =>
                  setDateTo(
                    e.target.value
                  )
                }
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm"
              />
            </div>
          </div>

          {dateFrom && dateTo && (
            <div className="p-3 bg-status-available/10 border border-status-available/25 rounded-lg text-xs text-status-available flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Duration: {days} day
              {days !== 1
                ? "s"
                : ""}
            </div>
          )}
        </div>

        {/* SUBMIT */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-primary text-primary-foreground rounded-xl py-3.5 font-bold text-sm hover:bg-primary/90 disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting…
            </>
          ) : (
            "Submit Request →"
          )}
        </button>
      </div>
    </>
  );
}