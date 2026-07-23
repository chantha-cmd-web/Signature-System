import React, { useState } from "react";
import { DocumentRecord } from "../types";
import {
  Calendar,
  Folder,
  Archive,
  MapPin,
  FileText,
  History,
  Trash2,
  Edit,
  Eye,
  ChevronDown,
  ChevronUp,
  User,
  Clock,
  ExternalLink,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface DocumentCardProps {
  document: DocumentRecord;
  onEdit: (doc: DocumentRecord) => void;
  onDelete: (id: string) => void;
  onView: (doc: DocumentRecord) => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onEdit,
  onDelete,
  onView,
}) => {
  const [showHistory, setShowHistory] = useState(false);

  // Status colors
  const statusColors = {
    "Signed & Completed": "status-pill status-completed",
    "Pending Review": "status-pill status-pending",
    Draft: "status-pill status-draft",
  };

  // Format YYYY-MM-DD to beautiful English date (e.g. July 21, 2026)
  const formatDateStr = (dateStr: string) => {
    try {
      const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "long",
        day: "numeric",
      };
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString("en-US", options);
    } catch {
      return dateStr;
    }
  };

  // Check if storage is cloud vs physical
  const isCloud =
    document.storageLocation.toLowerCase().includes("drive") ||
    document.storageLocation.toLowerCase().includes("onedrive") ||
    document.storageLocation.toLowerCase().includes("cloud") ||
    document.storageLocation.toLowerCase().includes("dropbox") ||
    document.storageLocation.toLowerCase().includes("server");

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="rounded-lg border bg-card text-card-foreground shadow-xs hover:shadow-sm transition-shadow duration-300 overflow-hidden flex flex-col justify-between"
      id={`document-card-${document.id}`}
    >
      {/* Header Area */}
      <div className="p-3.5 border-b border-border flex-1">
        <div className="flex justify-between items-center gap-3 mb-2.5">
          <span
            className={statusColors[document.status] || "status-pill"}
          >
            {document.status}
          </span>

          <div className="flex gap-1 opacity-60 hover:opacity-100 transition-opacity">
            <button
              onClick={() => onView(document)}
              className="p-1 hover:bg-accent hover:text-accent-foreground rounded transition-colors text-muted-foreground"
              title="View Details"
              id={`view-btn-${document.id}`}
            >
              <Eye className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onEdit(document)}
              className="p-1 hover:bg-accent hover:text-accent-foreground rounded transition-colors text-muted-foreground"
              title="Edit Record"
              id={`edit-btn-${document.id}`}
            >
              <Edit className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onDelete(document.id)}
              className="p-1 hover:bg-destructive/10 hover:text-destructive rounded transition-colors text-muted-foreground"
              title="Delete Record"
              id={`delete-btn-${document.id}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-foreground leading-snug font-sans tracking-tight hover:text-primary transition-colors">
          {document.documentName}
        </h3>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-y-2 gap-x-3 mt-3 text-[11px]">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="truncate">
              Signed:{" "}
              <strong className="text-foreground font-semibold">
                {formatDateStr(document.recordDate)}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Folder className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="truncate">
              Category:{" "}
              <strong className="text-foreground font-semibold">
                {document.category}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-muted-foreground col-span-2">
            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="truncate flex items-center gap-1 w-full">
              Storage:{" "}
              <strong className="text-foreground font-semibold truncate">
                {document.storageLocation}
              </strong>
              {isCloud && (
                <ExternalLink className="h-2.5 w-2.5 text-muted-foreground inline shrink-0" />
              )}
            </span>
          </div>
        </div>

        {/* Remarks/Summary Section */}
        {document.remarks && (
          <div className="mt-3 p-2 rounded bg-accent/40 border border-border/40 text-[11px] text-muted-foreground leading-relaxed">
            <div className="flex gap-1.5 items-start">
              <FileText className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
              <p className="line-clamp-2">{document.remarks}</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer Area with Expandable History */}
      <div className="bg-accent/10 border-t border-border">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="w-full px-3.5 py-2 text-[11px] flex justify-between items-center text-muted-foreground hover:text-foreground transition-colors font-medium"
          id={`toggle-audit-${document.id}`}
        >
          <span className="flex items-center gap-1.5">
            <History className="h-3 w-3" />
            Audit History ({document.auditLog?.length || 1})
          </span>
          {showHistory ? (
            <ChevronUp className="h-3.5 w-3.5 text-primary" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-primary" />
          )}
        </button>

        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden border-t border-border"
            >
              <div className="p-4 bg-card/60 space-y-3 max-h-[180px] overflow-y-auto">
                <div className="border-l-2 border-border pl-4 space-y-3 ml-2 relative">
                  {(document.auditLog || []).map((log, idx) => (
                    <div key={idx} className="relative text-[11px]">
                      {/* Timeline Dot */}
                      <span className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-primary border-2 border-background"></span>

                      <div className="flex justify-between items-center text-muted-foreground">
                        <span className="font-mono text-[9px] flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5" />
                          {new Date(log.timestamp).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <span className="flex items-center gap-0.5 max-w-[100px] truncate">
                          <User className="h-2.5 w-2.5 text-primary shrink-0" />
                          <span className="truncate">{log.user.split("@")[0]}</span>
                        </span>
                      </div>

                      <div className="mt-1">
                        <span className="font-semibold text-foreground">
                          {log.action}:{" "}
                        </span>
                        <span className="text-muted-foreground leading-normal">
                          {log.changes}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
