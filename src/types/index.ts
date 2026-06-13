// ─── Auth ──────────────────────────────────────────────────────
export type Role = "student" | "faculty" | "admin" | null;

export interface User {
  id: string;
  name: string;
  role: NonNullable<Role>;
  department: string;
  college: string;
  canManageAdmins?: boolean;
}

// ─── Hardware ──────────────────────────────────────────────────
export type AvailabilityStatus = "available" | "issued" | "reserved" | "maintenance" | "inspection";
export type FaultScanStatus =
  | "not-scanned"
  | "scanned-ok-before"
  | "scanned-ok-after"
  | "fault-detected"
  | "fault-evaluation";

export interface TimelineEntry {
  date: string;
  status: "success" | "pending" | "warning" | "error";
  description: string;
}

export interface HardwareItem {
  id: string;
  name: string;
  category: string;
  description: string;
  typicalUses: string[];
  labLocation: string;
  supervisor: string;
  availabilityStatus: AvailabilityStatus;
  faultScanStatus: FaultScanStatus;
  conditionLog: string;
  lastIssuedTo?: string;
  returnDate?: string;
  timeline: TimelineEntry[];
  emoji: string;
}

// ─── Requests ─────────────────────────────────────────────────
export type RequestStatus =
  | "pending_faculty"
  | "pending_lab"
  | "approved"
  | "rejected"
  | "issued"
  | "returned";

export interface RequestMessage {
  from: "me" | "lab" | "faculty";
  text: string;
  time: string;
  senderName?: string;
}

export interface EquipmentRequest {
  id: string;
  itemId: string;
  itemName: string;
  project: string;
  purpose: string;
  professorId: string;
  professorName: string;
  dateFrom: string;
  dateTo: string;
  status: RequestStatus;
  type: "individual" | "team";
  teamId?: string;
  studentId: string;
  studentName: string;
  messages: RequestMessage[];
  createdAt: string;
  requestCode?: string;
  qrToken?: string;
  equipment?: { slug?: string; name?: string; emoji?: string; labLocation?: string };
  student?: { name?: string; enrollmentId?: string; email?: string };
  faculty?: { name?: string };
}

// ─── Teams ────────────────────────────────────────────────────
export interface TeamMember {
  id: string;
  name: string;
  role: "Leader" | "Member";
}

export interface Team {
  id: string;
  name: string;
  project: string;
  professorId: string;
  professorName: string;
  members: TeamMember[];
  active: boolean;
  createdAt: string;
}

// ─── Feedback ─────────────────────────────────────────────────
export interface FeedbackEntry {
  id: string;
  department: string;
  type: string;
  message: string;
  rating: number;
  submittedBy: string;
  submittedByName: string;
  role: string;
  createdAt: string;
  read: boolean;
}

// ─── Messages ─────────────────────────────────────────────────
export interface MessageThread {
  id: string;
  participantId: string;
  participantName: string;
  participantRole: string;
  messages: RequestMessage[];
}
