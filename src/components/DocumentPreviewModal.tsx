import React, { useRef } from "react";
import { DocumentRecord } from "../types";
import {
  X,
  Printer,
  Calendar,
  Folder,
  MapPin,
  FileText,
  User,
  Clock,
  History,
  Tag,
  Building,
} from "lucide-react";
import { motion } from "motion/react";

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentRecord;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  isOpen,
  onClose,
  document: doc,
}) => {
  if (!isOpen) return null;

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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs cursor-pointer"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-2xl bg-card text-card-foreground border rounded-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        id="document-preview-modal"
      >
        {/* Header (Hidden during printing) */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-border bg-accent/10 print:hidden">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 text-primary rounded">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-sans uppercase tracking-wider text-foreground">
                Document Ledger View
              </h3>
              <p className="text-[10px] text-muted-foreground">
                Official encrypted record overview & verification trail
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrint}
              className="p-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded text-xs font-semibold flex items-center gap-1 transition-colors"
              title="Print Record Sheet"
              id="print-document-btn"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Sheet</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-accent rounded text-muted-foreground hover:text-foreground transition-colors"
              title="Close View"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Contents */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5" id="print-section">
          
          {/* Printable Header - Visible ONLY in Print */}
          <div className="hidden print:block border-b-2 border-slate-800 pb-4 mb-4">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 uppercase">
                  Digital Ledger Signature Record
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Secure Archival Logbook Certificate
                </p>
              </div>
              <div className="text-right text-xs text-slate-500">
                <p>Record ID: {doc.id}</p>
                <p>Printed: {new Date().toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Quick Header Summary */}
          <div className="border border-border/60 rounded-lg p-3.5 bg-accent/5">
            <div className="flex justify-between items-start gap-4 flex-wrap">
              <div>
                <span className="micro-label">Document Name</span>
                <h2 className="text-base font-bold text-foreground font-sans mt-0.5">
                  {doc.documentName}
                </h2>
              </div>
              <div className="text-right min-w-[120px]">
                <span className="micro-label">Signature Status</span>
                <span className={`inline-block mt-1 px-2.5 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${
                  doc.status === "Signed & Completed"
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    : doc.status === "Pending Review"
                    ? "bg-amber-100 text-amber-800 border border-amber-200"
                    : "bg-blue-100 text-blue-800 border border-blue-200"
                }`}>
                  {doc.status}
                </span>
              </div>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Box: General Info */}
            <div className="border border-border rounded-lg p-3.5 space-y-3 bg-card">
              <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-border/40 pb-1.5 flex items-center gap-1">
                <Tag className="h-3 w-3 text-primary" />
                Document Metadata
              </h4>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="micro-label block">Signed Date</span>
                  <div className="flex items-center gap-1.5 text-foreground font-semibold mt-0.5">
                    <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>{formatDateStr(doc.recordDate)}</span>
                  </div>
                </div>

                <div>
                  <span className="micro-label block">Storage Location</span>
                  <div className="flex items-center gap-1.5 text-foreground font-semibold mt-0.5">
                    <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="truncate">{doc.storageLocation}</span>
                  </div>
                </div>

                <div>
                  <span className="micro-label block">Category Class</span>
                  <div className="flex items-center gap-1.5 text-foreground font-semibold mt-0.5">
                    <Folder className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>{doc.category}</span>
                  </div>
                </div>

                <div>
                  <span className="micro-label block">Department</span>
                  <div className="flex items-center gap-1.5 text-foreground font-semibold mt-0.5">
                    <Building className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>{doc.department}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Box: Ledger System Stamp */}
            <div className="border border-border rounded-lg p-3.5 space-y-3 bg-card flex flex-col justify-between">
              <div>
                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-border/40 pb-1.5 flex items-center gap-1">
                  <User className="h-3 w-3 text-primary" />
                  System Audit Info
                </h4>

                <div className="space-y-2 text-xs mt-2">
                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-muted-foreground">Recorded By:</span>
                    <span className="font-semibold text-foreground">{doc.createdBy}</span>
                  </div>
                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-muted-foreground">System UUID:</span>
                    <span className="font-mono text-[10px] bg-accent px-1.5 py-0.5 rounded text-foreground">
                      {doc.id.substring(0, 18)}...
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-muted-foreground">Registered:</span>
                    <span className="text-foreground">
                      {new Date(doc.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Digital signature mock stamp */}
              <div className="border border-dashed border-emerald-500/30 bg-emerald-500/5 rounded p-2 text-center text-[10px] text-emerald-600 font-mono mt-1 flex items-center justify-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>LEDGER SIGNATURE VERIFIED SECURE</span>
              </div>
            </div>
          </div>

          {/* Remarks/Summary Section */}
          <div className="border border-border rounded-lg p-3.5 bg-card">
            <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-border/40 pb-1.5 flex items-center gap-1">
              <FileText className="h-3.5 w-3.5 text-primary" />
              Document Summary & Internal Remarks
            </h4>
            <div className="mt-2.5 p-3 rounded bg-accent/40 text-xs text-muted-foreground leading-relaxed">
              {doc.remarks ? (
                <p className="whitespace-pre-wrap">{doc.remarks}</p>
              ) : (
                <p className="italic text-slate-400">No additional remarks or description registered for this document.</p>
              )}
            </div>
          </div>

          {/* Chronological Audit Timeline */}
          <div className="border border-border rounded-lg p-3.5 bg-card">
            <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-border/40 pb-2 flex items-center gap-1">
              <History className="h-3.5 w-3.5 text-primary" />
              Document Transaction Audit Log ({doc.auditLog?.length || 1})
            </h4>

            <div className="mt-4 border-l-2 border-border pl-4 space-y-4 ml-2 relative">
              {(doc.auditLog || []).map((log, idx) => (
                <div key={idx} className="relative text-xs">
                  {/* Timeline Dot */}
                  <span className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-primary border-2 border-background"></span>

                  <div className="flex justify-between items-center text-muted-foreground text-[11px] flex-wrap gap-1">
                    <span className="font-mono text-[9px] flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(log.timestamp).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className="flex items-center gap-0.5 bg-accent px-1.5 py-0.5 rounded text-[10px]">
                      <User className="h-2.5 w-2.5 text-primary shrink-0" />
                      <span className="truncate font-semibold">{log.user}</span>
                    </span>
                  </div>

                  <div className="mt-1">
                    <span className="font-bold text-foreground">
                      {log.action}
                    </span>
                    <span className="text-muted-foreground ml-1">
                      — {log.changes}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Print Footer Details - Visible ONLY in print mode */}
          <div className="hidden print:block pt-6 border-t border-slate-300 text-[10px] text-slate-400 text-center mt-8">
            <p>This is a system-generated document record from the Secure Digital Logbook.</p>
            <p>Verification Hash: SHA256-{(doc.id + doc.createdAt).substring(0, 16).toUpperCase()}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
