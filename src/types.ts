export interface AuditLogEntry {
  timestamp: string;
  action: string;
  changes: string;
  user: string;
}

export interface DocumentRecord {
  id: string;
  documentName: string;
  recordDate: string; // YYYY-MM-DD
  category: string;
  department: string;
  status: "Signed & Completed" | "Pending Review" | "Draft";
  storageLocation: string;
  remarks: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  auditLog: AuditLogEntry[];
}

export type Theme = "light" | "dark";
