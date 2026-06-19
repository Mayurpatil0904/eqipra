// src/lib/api.ts — typed API client for Equipra backend
const BASE =
  (import.meta as any).env?.VITE_API_URL ??
  "http://localhost:5000/api";

// ── Token helpers ─────────────────────────────────────────────
export const token = {
  get:   ()          => localStorage.getItem("eq_token") ?? "",
  set:   (t: string) => localStorage.setItem("eq_token", t),
  clear: ()          => localStorage.removeItem("eq_token"),
};

// ── Core fetch wrapper ────────────────────────────────────────
async function req<T>(method: string, path: string, body?: unknown): Promise<T> {
  const t = token.get();
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(t ? { Authorization: `Bearer ${t}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message ?? `HTTP ${res.status}`);
  return json.data as T;
}

async function reqForm<T>(method: string, path: string, form: FormData): Promise<T> {
  const t = token.get();
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: t ? { Authorization: `Bearer ${t}` } : {},
    body: form,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message ?? `HTTP ${res.status}`);
  return json.data as T;
}

// ✅ NEW — for endpoints that return a raw file (xlsx/csv) instead of JSON.
// Fetches the file as a Blob, reads the filename from the
// Content-Disposition header if present, and triggers a browser download.
async function downloadFile(
  path: string,
  fallbackFilename: string
): Promise<void> {
  const t = token.get();
  const res = await fetch(`${BASE}${path}`, {
    headers: t ? { Authorization: `Bearer ${t}` } : {},
  });

  if (!res.ok) {
    // Error responses are still JSON — surface the real message
    const json = await res.json().catch(() => ({}));
    throw new Error(json.message ?? `HTTP ${res.status}`);
  }

  const disposition = res.headers.get("Content-Disposition") ?? "";
  const match = disposition.match(/filename="?([^"]+)"?/);
  const filename = match?.[1] ?? fallbackFilename;

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

const get    = <T>(p: string)              => req<T>("GET",    p);
const post   = <T>(p: string, b: unknown)  => req<T>("POST",   p, b);
const patch  = <T>(p: string, b?: unknown) => req<T>("PATCH",  p, b);
const put    = <T>(p: string, b: unknown)  => req<T>("PUT",    p, b);
const del    = <T>(p: string)              => req<T>("DELETE", p);

// ── Auth ──────────────────────────────────────────────────────
export const authApi = {
  login: (d: { enrollmentId: string; password: string; collegeName: string; role: string }) =>
    post<{ token: string; user: any }>("/auth/login", d),
  me: () => get<any>("/auth/me"),
  changePassword: (d: { currentPassword: string; newPassword: string }) =>
    put<any>("/auth/change-password", d),
  colleges: () => get<any[]>("/auth/colleges"),
};

// ── Equipment ─────────────────────────────────────────────────
export const equipmentApi = {
  list: (p?: { category?: string; status?: string; q?: string }) => {
    const qs = p ? "?" + new URLSearchParams(p as any).toString() : "";
    return get<any[]>(`/equipment${qs}`);
  },
  get:        (slug: string)         => get<any>(`/equipment/${slug}`),
  categories: ()                     => get<string[]>("/equipment/categories"),
  create:     (d: any)               => post<any>("/equipment", d),
  update:     (slug: string, d: any) => patch<any>(`/equipment/${slug}`, d),
  remove:     (slug: string)         => del<any>(`/equipment/${slug}`),
  // ✅ NEW — Fault Scan page lookup by human-readable Equipment ID (EQ-0001),
  // returns FULL timeline history (not limited to 5)
  lookupByEquipmentId: (equipmentId: string) => get<any>(`/equipment/lookup/${equipmentId}`),

  // ✅ NEW — bulk-import many equipment items at once from Excel/CSV
  bulkUpload: (file: File) => {
    const f = new FormData();
    f.append("file", file);
    return reqForm<{ message: string; added: any[]; skipped: any[] }>(
      "POST", "/equipment/bulk-upload", f
    );
  },
  downloadBulkUploadTemplate: () =>
    downloadFile("/equipment/bulk-upload-template", "equipra-equipment-template.xlsx"),
};

// ── Requests ──────────────────────────────────────────────────
export const requestsApi = {
  list: (p?: { status?: string }) => {
    const qs = p ? "?" + new URLSearchParams(p as any).toString() : "";
    return get<any[]>(`/requests${qs}`);
  },

  get: (id: string) =>
    get<any>(`/requests/${id}`),

  create: (d: any) =>
    post<any>("/requests", d),

  facultyDecision: (
    id: string,
    approved: boolean
  ) =>
    post<any>(
      `/requests/${id}/faculty-decision`,
      { approved }
    ),

  labDecision: (
    id: string,
    approved: boolean,
    msg: string
  ) =>
    post<any>(
      `/requests/${id}/lab-decision`,
      {
        approved,
        message: msg,
      }
    ),

  markReturned: (id: string, data: { conditionRating: number; damageNotes?: string; damagePercent?: number }) =>
    patch<any>(`/requests/${id}/return`, data),

  getByQr: (token: string) =>
    get<any>(`/requests/scan/${token}`),

  clearInspection: (slug: string, action: string) =>
    patch<any>(`/requests/equipment/${slug}/clear-inspection`, { action }),

  addMessage: (
    id: string,
    text: string
  ) =>
    post<any>(
      `/requests/${id}/messages`,
      { text }
    ),
};
// ── Teams ─────────────────────────────────────────────────────
export const teamsApi = {
  list:          ()                                        => get<any[]>("/teams"),
  get:           (code: string)                            => get<any>(`/teams/${code}`),
  create:        (d: { name: string; project: string })    => post<any>("/teams", d),
  uploadMembers: (code: string, file: File) => {
    const f = new FormData(); f.append("file", file);
    return reqForm<any>("POST", `/teams/${code}/upload-members`, f);
  },
  deactivate: (code: string) => patch<any>(`/teams/${code}/deactivate`),
};

// ── Fault Scans ───────────────────────────────────────────────
export const faultScanApi = {
  list:   (slug?: string) => get<any[]>(`/fault-scans${slug ? `?equipmentSlug=${slug}` : ""}`),
  create: (d: { equipmentSlug: string; result: "ok" | "fault"; notes?: string }) =>
    post<any>("/fault-scans", d),
};

// ── Feedback ──────────────────────────────────────────────────
export const feedbackApi = {
  submit:   (d: any)       => post<any>("/feedback", d),
  list:     (p?: any)      => get<any[]>(`/feedback${p ? "?" + new URLSearchParams(p).toString() : ""}`),
  markRead: (id: string)   => patch<any>(`/feedback/${id}/read`),
};

// ── Messages ──────────────────────────────────────────────────
export const messagesApi = {
  threads:   ()                               => get<any[]>("/messages/threads"),
  getThread: (partnerId: string)              => get<any>(`/messages/threads/${partnerId}`),
  send:      (partnerId: string, text: string) => post<any>(`/messages/threads/${partnerId}`, { text }),
};

// ── Notifications ─────────────────────────────────────────────
export const notificationsApi = {
  list:        ()           => get<any[]>("/notifications"),
  markRead:    (id: string) => patch<any>(`/notifications/${id}/read`),
  markAllRead: ()           => patch<any>("/notifications/read-all"),
};

// ── Admin ─────────────────────────────────────────────────────
export const adminApi = {
  stats:             ()                         => get<any>("/admin/stats"),
  users:             (p?: { role?: string; q?: string }) => {
    const qs = p ? "?" + new URLSearchParams(p as any).toString() : "";
    return get<any[]>(`/admin/users${qs}`);
  },
  
  createUser:        (d: any)                   => post<any>("/admin/users", d),
  updateUser:        (id: string, d: any)       => patch<any>(`/admin/users/${id}`, d),
  deactivateUser:    (id: string)               => patch<any>(`/admin/users/${id}/deactivate`),
  resetUserPassword: (id: string, newPassword: string) =>
    patch<any>(`/admin/users/${id}/reset-password`, { newPassword }),
  colleges:          ()                         => get<any[]>("/admin/colleges"),
  createCollege:     (d: { name: string })      => post<any>("/admin/colleges", d),
  updateCollege: (id: string, d: any) =>
  patch<any>(`/admin/colleges/${id}`, d),

  deleteCollege: (id: string) =>
  del<any>(`/admin/colleges/${id}`),

  // ✅ NEW — bank-statement-style equipment transaction report,
  // downloaded directly as a file (xlsx or csv)
  downloadEquipmentReport: (p: { from: string; to: string; format: "xlsx" | "csv"; department?: string }) => {
    const qs = new URLSearchParams(p as any).toString();
    const ext = p.format === "csv" ? "csv" : "xlsx";
    return downloadFile(`/admin/equipment-report?${qs}`, `equipra-transactions-${p.from}_to_${p.to}.${ext}`);
  },

  // ✅ NEW — bulk-import students/faculty from Excel/CSV
  bulkUploadUsers: (file: File) => {
    const f = new FormData();
    f.append("file", file);
    return reqForm<{ message: string; added: any[]; skipped: any[] }>(
      "POST", "/admin/users/bulk-upload", f
    );
  },
  downloadUserTemplate: () =>
    downloadFile("/admin/users/bulk-upload-template", "equipra-users-template.xlsx"),
};

// ── Professors ────────────────────────────────────────────────
export const professorsApi = {
  list: () => get<{ id: string; name: string; enrollmentId: string; department: string }[]>("/professors"),
};
