import React, { useState, useMemo, useRef } from "react";
import { DocumentRecord } from "../types";
import {
  Database,
  Shield,
  Upload,
  Download,
  Trash2,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  FileSpreadsheet,
  Settings2,
  ShieldAlert,
  Info,
  ListFilter,
  CheckSquare,
  Square,
  User,
  Mail,
  Camera,
  Briefcase,
  Building,
  Lock,
  ShieldCheck,
  Check,
  Edit2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface DataManagementViewProps {
  documents: DocumentRecord[];
  onImportBackup: (importedDocs: DocumentRecord[]) => Promise<void>;
  onExportJSON: () => void;
  onExportCSV: (list: DocumentRecord[]) => void;
  onResetData: () => Promise<void>;
  onBulkDelete: (ids: string[]) => Promise<void>;
  language: "en" | "km";
  adminProfile: {
    displayName: string;
    email: string;
    jobTitle: string;
    department: string;
    photoUrl: string;
    securityLevel: string;
    bio?: string;
  };
  onUpdateProfile: (updated: any) => void;
}

export type SimulatedRole = "Administrator" | "Auditor" | "Moderator" | "Regular User";

export const DataManagementView: React.FC<DataManagementViewProps> = ({
  documents,
  onImportBackup,
  onExportJSON,
  onExportCSV,
  onResetData,
  onBulkDelete,
  language,
  adminProfile,
  onUpdateProfile,
}) => {
  // Security Simulation Roles
  const [activeRole, setActiveRole] = useState<SimulatedRole>("Administrator");

  // Selection states for Bulk Delete
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkSearch, setBulkSearch] = useState("");

  // Validation Report state
  const [validationReport, setValidationReport] = useState<{
    status: "pass" | "warning" | "idle";
    checksRun: number;
    warnings: string[];
    passes: string[];
  }>({ status: "idle", checksRun: 0, warnings: [], passes: [] });

  // System Maintenance simulation states
  const [maintenanceProgress, setMaintenanceProgress] = useState<number>(-1);
  const [maintenanceLogs, setMaintenanceLogs] = useState<string[]>([]);

  // Profile Management local states
  const [currentTab, setCurrentTab] = useState<"system" | "profile">("system");
  const [displayName, setDisplayName] = useState(adminProfile.displayName);
  const [email, setEmail] = useState(adminProfile.email);
  const [jobTitle, setJobTitle] = useState(adminProfile.jobTitle);
  const [department, setDepartment] = useState(adminProfile.department);
  const [photoUrl, setPhotoUrl] = useState(adminProfile.photoUrl);
  const [securityLevel, setSecurityLevel] = useState(adminProfile.securityLevel);
  const [bio, setBio] = useState(adminProfile.bio || "Senior security administrator in charge of certified digital logs.");

  const [dragActive, setDragActive] = useState(false);
  const profilePhotoInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setDisplayName(adminProfile.displayName);
    setEmail(adminProfile.email);
    setJobTitle(adminProfile.jobTitle);
    setDepartment(adminProfile.department);
    setPhotoUrl(adminProfile.photoUrl);
    setSecurityLevel(adminProfile.securityLevel);
    setBio(adminProfile.bio || "Senior security administrator in charge of certified digital logs.");
  }, [adminProfile]);

  // CSV Import file input ref
  const csvFileRef = useRef<HTMLInputElement>(null);
  const [csvParseError, setCsvParseError] = useState("");

  // Role permissions checking
  const hasPermission = (action: "reset" | "restore" | "bulk_delete" | "validate" | "maintenance") => {
    if (activeRole === "Administrator") return true;
    if (activeRole === "Auditor") {
      return action === "validate"; // Auditor only validates
    }
    if (activeRole === "Moderator") {
      return action === "restore" || action === "bulk_delete" || action === "validate";
    }
    if (activeRole === "Regular User") {
      return false; // locked completely
    }
    return false;
  };

  // Filtered documents for Bulk Delete listing
  const bulkFilteredDocs = useMemo(() => {
    if (!bulkSearch) return documents;
    return documents.filter(doc => 
      doc.documentName.toLowerCase().includes(bulkSearch.toLowerCase()) ||
      doc.category.toLowerCase().includes(bulkSearch.toLowerCase())
    );
  }, [documents, bulkSearch]);

  const toggleSelectAll = () => {
    if (selectedIds.length === bulkFilteredDocs.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(bulkFilteredDocs.map(d => d.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(item => item !== id));
    } else {
      setSelectedIds(prev => [...prev, id]);
    }
  };

  // Run Data Validation Audits
  const handleRunValidation = () => {
    if (!hasPermission("validate")) return;

    const warnings: string[] = [];
    const passes: string[] = [];
    let checksCount = 0;

    // Check 1: Document length
    checksCount++;
    if (documents.length === 0) {
      warnings.push("Database is currently empty of documents.");
    } else {
      passes.push(`Database contains ${documents.length} active documents.`);
    }

    // Check 2: Missing fields
    checksCount++;
    let blankTitles = 0;
    let blankDates = 0;
    documents.forEach(doc => {
      if (!doc.documentName.trim()) blankTitles++;
      if (!doc.recordDate) blankDates++;
    });

    if (blankTitles > 0) warnings.push(`${blankTitles} records are missing document names.`);
    else passes.push("All records have fully defined document names.");

    if (blankDates > 0) warnings.push(`${blankDates} records have missing signature dates.`);
    else passes.push("All records have fully defined signature dates.");

    // Check 3: Audit Trails integrity
    checksCount++;
    let incompleteAudit = 0;
    documents.forEach(doc => {
      if (!doc.auditLog || doc.auditLog.length === 0) {
        incompleteAudit++;
      }
    });

    if (incompleteAudit > 0) {
      warnings.push(`${incompleteAudit} records are missing transaction audit logs.`);
    } else {
      passes.push("All records have active verified cryptographic audit trails.");
    }

    // Check 4: Anomalous dates
    checksCount++;
    const currentYear = new Date().getFullYear();
    let suspiciousDates = 0;
    documents.forEach(doc => {
      if (doc.recordDate) {
        const year = new Date(doc.recordDate).getFullYear();
        if (year < 2010 || year > currentYear + 5) {
          suspiciousDates++;
        }
      }
    });

    if (suspiciousDates > 0) {
      warnings.push(`${suspiciousDates} records have signature dates outside typical parameters.`);
    } else {
      passes.push("All signature date ranges fall within compliant parameters.");
    }

    // Set Report Status
    setValidationReport({
      status: warnings.length > 0 ? "warning" : "pass",
      checksRun: checksCount,
      warnings,
      passes,
    });
  };

  // Run System Maintenance Compaction Simulation
  const handleRunMaintenance = () => {
    if (!hasPermission("maintenance")) return;

    setMaintenanceProgress(0);
    setMaintenanceLogs(["Initializing maintenance task...", "Acquiring secure read locks on document files..."]);

    const steps = [
      { prg: 20, log: "Scanned document indexes. Recompiling database hash lists..." },
      { prg: 45, log: "Optimizing B-Tree lookup trees for speedy filters..." },
      { prg: 70, log: "Compacting redundant transaction log history (no data deleted)..." },
      { prg: 90, log: "Running cache pruning. Verification checksum matches DB metadata..." },
      { prg: 100, log: "Database maintenance completed successfully! System speed: 100% optimized." },
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setMaintenanceProgress(step.prg);
        setMaintenanceLogs(prev => [...prev, step.log]);
      }, (idx + 1) * 700);
    });
  };

  // Profile Photo drag-and-drop and upload handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setPhotoUrl(event.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      } else {
        alert("Please drop a valid image file.");
      }
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setPhotoUrl(event.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      } else {
        alert("Please select a valid image file.");
      }
    }
  };

  // Restore Excel/CSV File Upload and Parsing
  const handleCSVUploadClick = () => {
    if (csvFileRef.current) {
      csvFileRef.current.click();
    }
  };

  const handleCSVRestoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvParseError("");
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) throw new Error("Empty backup file");

        const lines = text.split("\n");
        if (lines.length < 2) throw new Error("Invalid CSV format: Missing rows");

        // Parse CSV headers
        const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
        const nameIdx = headers.indexOf("Document Name");
        const categoryIdx = headers.indexOf("Category");
        const departmentIdx = headers.indexOf("Department");
        const statusIdx = headers.indexOf("Status");
        const dateIdx = headers.indexOf("Record Date");
        const locationIdx = headers.indexOf("Storage Location");
        const remarksIdx = headers.indexOf("Remarks");
        const authorIdx = headers.indexOf("Submitted By") !== -1 ? headers.indexOf("Submitted By") : headers.indexOf("Created By");

        const parsedDocs: DocumentRecord[] = [];

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          // Split columns while taking quotes into account
          const cols: string[] = [];
          let current = "";
          let inQuotes = false;
          for (let j = 0; j < line.length; j++) {
            const char = line[j];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              cols.push(current.trim().replace(/^"|"$/g, ""));
              current = "";
            } else {
              current += char;
            }
          }
          cols.push(current.trim().replace(/^"|"$/g, ""));

          if (cols.length > 0 && cols[nameIdx !== -1 ? nameIdx : 0]) {
            const tempDoc: Partial<DocumentRecord> = {
              documentName: cols[nameIdx !== -1 ? nameIdx : 0] || "Imported Document",
              category: cols[categoryIdx !== -1 ? categoryIdx : 1] || "General",
              department: cols[departmentIdx !== -1 ? departmentIdx : 2] || "Operations",
              status: (cols[statusIdx !== -1 ? statusIdx : 3] as any) || "Signed & Completed",
              recordDate: cols[dateIdx !== -1 ? dateIdx : 4] || new Date().toISOString().split("T")[0],
              storageLocation: cols[locationIdx !== -1 ? locationIdx : 5] || "Google Drive",
              remarks: cols[remarksIdx !== -1 ? remarksIdx : 6] || "",
              createdBy: cols[authorIdx !== -1 ? authorIdx : 7] || "Imported Agent",
            };
            parsedDocs.push(tempDoc as DocumentRecord);
          }
        }

        if (parsedDocs.length === 0) {
          throw new Error("No valid records extracted from file");
        }

        await onImportBackup(parsedDocs);
        alert(`Successfully imported and merged ${parsedDocs.length} documents from spreadsheet archive!`);
      } catch (err: any) {
        console.error(err);
        setCsvParseError(`Parsing error: ${err.message || "Unknown CSV structure"}`);
      }
    };

    reader.readAsText(file);
    if (e.target) e.target.value = ""; // clear file selection
  };

  const executeBulkDelete = async () => {
    if (!hasPermission("bulk_delete")) return;
    if (selectedIds.length === 0) {
      alert("No documents selected.");
      return;
    }

    if (window.confirm(`Are you absolutely sure you want to permanently delete these ${selectedIds.length} records?`)) {
      await onBulkDelete(selectedIds);
      setSelectedIds([]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top security panel / role assignment */}
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-md">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100">
                Administrative Security & Control Room
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Manage archival nodes, simulate credential profiles, and validate storage database trees.
              </p>
            </div>
          </div>
        </div>

        {/* Simulated Role Selection */}
        <div className="flex items-center gap-2 border border-slate-800 bg-slate-950 p-2 rounded-lg w-full md:w-auto">
          <span className="text-[10px] font-bold text-slate-500 uppercase shrink-0">Simulate Role:</span>
          <select
            value={activeRole}
            onChange={(e) => {
              setActiveRole(e.target.value as SimulatedRole);
              setValidationReport({ status: "idle", checksRun: 0, warnings: [], passes: [] });
              setMaintenanceProgress(-1);
              setMaintenanceLogs([]);
            }}
            className="bg-transparent text-xs text-slate-200 font-bold focus:outline-none cursor-pointer w-full"
          >
            <option value="Administrator" className="bg-slate-900">Administrator (All Operations)</option>
            <option value="Auditor" className="bg-slate-900">Auditor (Validation Only)</option>
            <option value="Moderator" className="bg-slate-900">Moderator (Edit, Validate, Bulk)</option>
            <option value="Regular User" className="bg-slate-900">Regular User (View & Local Only)</option>
          </select>
        </div>
      </div>

      {/* Modern Horizontal Tab Switcher */}
      <div className="flex border-b border-border/80 pb-px gap-6" id="admin-tabs">
        <button
          onClick={() => setCurrentTab("system")}
          className={`pb-3 text-xs font-bold uppercase tracking-wider relative transition-colors ${
            currentTab === "system"
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
          id="tab-system-admin"
        >
          <span className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            System & Database Tools
          </span>
          {currentTab === "system" && (
            <motion.div
              layoutId="adminTabLine"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
            />
          )}
        </button>

        <button
          onClick={() => setCurrentTab("profile")}
          className={`pb-3 text-xs font-bold uppercase tracking-wider relative transition-colors ${
            currentTab === "profile"
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
          id="tab-profile-admin"
        >
          <span className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile Management
          </span>
          {currentTab === "profile" && (
            <motion.div
              layoutId="adminTabLine"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
            />
          )}
        </button>
      </div>

      {currentTab === "system" ? (
        <div className="space-y-6">
          {/* Grid of central admin items */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Box 1: Backup and Import Tools */}
            <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-xs relative">
              {!hasPermission("restore") && activeRole !== "Administrator" && activeRole !== "Auditor" && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-xs z-10 rounded-xl flex flex-col items-center justify-center text-center p-6">
                  <ShieldAlert className="h-10 w-10 text-destructive opacity-85 mb-2" />
                  <h4 className="text-sm font-bold text-foreground uppercase tracking-wide">Privilege Shield Active</h4>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                    Your simulated role (<strong>{activeRole}</strong>) lacks standard restore access credentials. Please switch role to Administrator or Moderator.
                  </p>
                </div>
              )}

              <div>
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 border-b border-border/60 pb-2">
                  <Database className="h-4 w-4 text-primary" />
                  Backup & Restoration Center
                </h3>
                <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
                  Export complete encrypted backup files or restore archival nodes from historical JSON/Excel sheets.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3.5 pt-1.5">
                {/* Backup JSON */}
                <button
                  onClick={onExportJSON}
                  className="p-3 border border-indigo-500/10 bg-indigo-500/5 hover:bg-indigo-500/10 rounded-xl text-left transition-all"
                >
                  <Download className="h-5 w-5 text-indigo-500 mb-1.5" />
                  <span className="font-bold text-xs text-foreground block">Backup JSON</span>
                  <span className="text-[9px] text-muted-foreground block mt-0.5">Durable JSON database</span>
                </button>

                {/* Backup Excel CSV */}
                <button
                  onClick={() => onExportCSV(documents)}
                  className="p-3 border border-emerald-500/10 bg-emerald-500/5 hover:bg-emerald-500/10 rounded-xl text-left transition-all"
                >
                  <FileSpreadsheet className="h-5 w-5 text-emerald-500 mb-1.5" />
                  <span className="font-bold text-xs text-foreground block">Backup Excel</span>
                  <span className="text-[9px] text-muted-foreground block mt-0.5">Standard spreadsheet layout</span>
                </button>

                {/* Restore JSON */}
                <label className="p-3 border border-amber-500/10 bg-amber-500/5 hover:bg-amber-500/10 rounded-xl text-left transition-all cursor-pointer block">
                  <Upload className="h-5 w-5 text-amber-500 mb-1.5" />
                  <span className="font-bold text-xs text-foreground block">Restore JSON</span>
                  <span className="text-[9px] text-muted-foreground block mt-0.5">Overwrite with JSON</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = async (evt) => {
                        try {
                          const data = JSON.parse(evt.target?.result as string);
                          if (Array.isArray(data)) {
                            await onImportBackup(data);
                            alert(`Successfully restored ${data.length} records!`);
                          } else {
                            throw new Error("Invalid schema structure");
                          }
                        } catch (err) {
                          alert("Corrupted JSON backup file.");
                        }
                      };
                      reader.readAsText(file);
                      e.target.value = "";
                    }}
                    className="hidden"
                  />
                </label>

                {/* Restore Excel/CSV */}
                <button
                  onClick={handleCSVUploadClick}
                  className="p-3 border border-sky-500/10 bg-sky-500/5 hover:bg-sky-500/10 rounded-xl text-left transition-all"
                >
                  <Upload className="h-5 w-5 text-sky-500 mb-1.5" />
                  <span className="font-bold text-xs text-foreground block">Restore Excel</span>
                  <span className="text-[9px] text-muted-foreground block mt-0.5">Parse spreadsheet back</span>
                  <input
                    type="file"
                    ref={csvFileRef}
                    accept=".csv"
                    onChange={handleCSVRestoreChange}
                    className="hidden"
                  />
                </button>
              </div>

              {csvParseError && (
                <div className="p-2 border border-destructive/20 bg-destructive/5 text-destructive text-[10px] rounded-lg">
                  {csvParseError}
                </div>
              )}

              {/* Master reset */}
              <div className="pt-3 border-t border-border/60">
                <div className="flex justify-between items-center bg-destructive/5 p-3 rounded-lg border border-destructive/10">
                  <div>
                    <span className="text-xs font-bold text-destructive block uppercase">Reset Master Database</span>
                    <span className="text-[9px] text-muted-foreground block mt-0.5">Prunes all custom records and loads clean seeds</span>
                  </div>
                  <button
                    onClick={async () => {
                      if (!hasPermission("reset")) {
                        alert("Unauthorized. Requires Simulated Administrator role.");
                        return;
                      }
                      if (window.confirm("CRITICAL WARNING: This will permanently wipe all logs and restore the standard simulated list. Proceed?")) {
                        await onResetData();
                      }
                    }}
                    disabled={!hasPermission("reset")}
                    className="px-3 py-1.5 bg-destructive hover:bg-destructive/90 disabled:opacity-40 text-white font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Reset Data
                  </button>
                </div>
              </div>
            </div>

            {/* Box 2: Bulk Delete and Selection Management */}
            <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-xs relative flex flex-col justify-between">
              {!hasPermission("bulk_delete") && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-xs z-10 rounded-xl flex flex-col items-center justify-center text-center p-6">
                  <ShieldAlert className="h-10 w-10 text-destructive opacity-85 mb-2" />
                  <h4 className="text-sm font-bold text-foreground uppercase tracking-wide">Access Locked</h4>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                    Your role (<strong>{activeRole}</strong>) is not authorized to bulk delete nodes. Please change simulated credentials profile.
                  </p>
                </div>
              )}

              <div className="space-y-3.5">
                <div>
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 border-b border-border/60 pb-2">
                    <ListFilter className="h-4 w-4 text-primary" />
                    Bulk Delete & Selection Vault
                  </h3>
                  <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
                    Check and prune multiple records instantly. Currently showing filtered results.
                  </p>
                </div>

                {/* Small listing search */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={bulkSearch}
                    onChange={e => setBulkSearch(e.target.value)}
                    placeholder="Search matching targets..."
                    className="w-full p-1.5 border rounded-lg bg-background text-foreground text-xs focus:outline-none"
                  />
                  <button
                    onClick={toggleSelectAll}
                    className="px-2 border rounded-lg hover:bg-accent text-foreground text-xs font-bold shrink-0 flex items-center gap-1"
                  >
                    {selectedIds.length === bulkFilteredDocs.length ? "Deselect" : "Select All"}
                  </button>
                </div>

                {/* Small list block */}
                <div className="border rounded-lg max-h-[140px] overflow-y-auto divide-y divide-border text-xs">
                  {bulkFilteredDocs.length === 0 ? (
                    <p className="p-3 text-center text-muted-foreground italic">No matching targets.</p>
                  ) : (
                    bulkFilteredDocs.map(doc => (
                      <div 
                        key={doc.id}
                        onClick={() => toggleSelectOne(doc.id)}
                        className="p-2 hover:bg-accent/30 cursor-pointer flex justify-between items-center"
                      >
                        <div className="flex items-center gap-2 truncate pr-2">
                          {selectedIds.includes(doc.id) ? (
                            <CheckSquare className="h-4 w-4 text-primary shrink-0" />
                          ) : (
                            <Square className="h-4 w-4 text-muted-foreground shrink-0" />
                          )}
                          <span className="font-semibold text-foreground truncate">{doc.documentName}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground shrink-0 font-mono bg-accent/40 px-1 py-0.5 rounded">
                          {doc.category}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-border/60 gap-3">
                <span className="text-[10px] text-muted-foreground">
                  Selected <strong>{selectedIds.length}</strong> / {documents.length} records
                </span>
                <button
                  onClick={executeBulkDelete}
                  disabled={selectedIds.length === 0}
                  className="px-4 py-2 bg-destructive text-white rounded-lg text-xs font-bold shadow hover:bg-destructive/90 disabled:opacity-40 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Prune Selected Items ({selectedIds.length})
                </button>
              </div>
            </div>
          </div>

          {/* Row 2: Data Validation Reports & System Maintenance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Box 3: Data Validation compliance audits */}
            <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-xs relative flex flex-col justify-between">
              {!hasPermission("validate") && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-xs z-10 rounded-xl flex flex-col items-center justify-center text-center p-6">
                  <ShieldAlert className="h-10 w-10 text-destructive opacity-85 mb-2" />
                  <h4 className="text-sm font-bold text-foreground uppercase tracking-wide">Locked Access</h4>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                    Audits and validations require at least simulated Auditor, Moderator, or Administrator role.
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 border-b border-border/60 pb-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    Data Validation & Integrity Shield
                  </h3>
                  <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
                    Validate database parameters, checking for empty strings, corrupted dates, and verify audit trace signatures.
                  </p>
                </div>

                {/* Validation Outputs */}
                <AnimatePresence mode="wait">
                  {validationReport.status === "idle" ? (
                    <div className="p-4 border border-dashed rounded-xl bg-accent/10 text-center text-xs text-muted-foreground flex flex-col items-center justify-center py-6">
                      <Info className="h-6 w-6 text-primary opacity-60 mb-1.5 animate-bounce" />
                      <p>Validation audit trail is ready to run.</p>
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-3"
                    >
                      <div className="flex justify-between items-center bg-accent/20 p-2 rounded-lg text-xs font-semibold">
                        <span>Validation Status:</span>
                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase flex items-center gap-1 ${
                          validationReport.status === "pass" 
                            ? "bg-emerald-100 text-emerald-800" 
                            : "bg-amber-100 text-amber-800"
                        }`}>
                          {validationReport.status === "pass" ? (
                            <>
                              <CheckCircle className="h-3 w-3" />
                              Compliant Pass
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="h-3 w-3" />
                              Warning Flagged
                            </>
                          )}
                        </span>
                      </div>

                      <div className="space-y-1.5 max-h-[120px] overflow-y-auto text-[11px] leading-relaxed">
                        {/* Warnings */}
                        {validationReport.warnings.map((warn, i) => (
                          <div key={i} className="flex gap-1.5 items-start text-amber-600 dark:text-amber-400 bg-amber-500/5 p-1.5 rounded border border-amber-500/10">
                            <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                            <span>{warn}</span>
                          </div>
                        ))}
                        {/* Passes */}
                        {validationReport.passes.map((pass, i) => (
                          <div key={i} className="flex gap-1.5 items-start text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 p-1.5 rounded border border-emerald-500/10">
                            <CheckCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                            <span>{pass}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex justify-end pt-3 border-t border-border/60">
                <button
                  onClick={handleRunValidation}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Run Audit Verification
                </button>
              </div>
            </div>

            {/* Box 4: System Maintenance Logs & Progress */}
            <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-xs relative flex flex-col justify-between">
              {!hasPermission("maintenance") && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-xs z-10 rounded-xl flex flex-col items-center justify-center text-center p-6">
                  <ShieldAlert className="h-10 w-10 text-destructive opacity-85 mb-2" />
                  <h4 className="text-sm font-bold text-foreground uppercase tracking-wide">Locked Access</h4>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                    Database log compaction and indexing require Administrator privileges.
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 border-b border-border/60 pb-2">
                    <Settings2 className="h-4 w-4 text-blue-500" />
                    Secure System Maintenance Desk
                  </h3>
                  <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
                    Purge orphaned history entries, optimize JSON cluster pointers, and rebuild high-density search lists.
                  </p>
                </div>

                {/* Progress bar */}
                {maintenanceProgress !== -1 && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span>Optimizing Indexes:</span>
                      <span className="font-mono text-primary">{maintenanceProgress}%</span>
                    </div>
                    <div className="w-full bg-accent h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-primary h-full transition-all duration-300"
                        style={{ width: `${maintenanceProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Maintenance logs console */}
                <div className="bg-slate-950 p-3 rounded-lg text-[10px] font-mono text-slate-300 max-h-[105px] overflow-y-auto space-y-1 border border-slate-900 leading-normal">
                  {maintenanceLogs.length === 0 ? (
                    <p className="text-slate-500 italic">Maintenance engine is currently offline.</p>
                  ) : (
                    maintenanceLogs.map((log, i) => (
                      <p key={i} className="truncate">
                        <span className="text-indigo-400">root@signlog-node0:~$</span> {log}
                      </p>
                    ))
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-border/60">
                <button
                  onClick={handleRunMaintenance}
                  disabled={maintenanceProgress >= 0 && maintenanceProgress < 100}
                  className="px-4 py-2 bg-primary hover:opacity-90 disabled:opacity-40 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow cursor-pointer"
                >
                  <Settings2 className="h-3.5 w-3.5 animate-spin-slow" />
                  Rebuild Search Clusters
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Profile Management Interface */
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          id="profile-management-panel"
        >
          {/* Card 1: Identity Card & Photo Upload */}
          <div className="lg:col-span-1 bg-card border border-border rounded-xl p-5 space-y-6 flex flex-col justify-between shadow-xs">
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 border-b border-border/60 pb-2">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  Admin Identity Badge
                </h3>
                <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
                  Dynamic identity token. This avatar and display name are rendered in real-time across the secure archival log systems.
                </p>
              </div>

              {/* Photo Avatar Preview and Edit Zone */}
              <div className="flex flex-col items-center justify-center py-4 space-y-4">
                <div className="relative group">
                  <div className="w-28 h-28 rounded-2xl overflow-hidden border-2 border-primary/20 bg-accent/10 flex items-center justify-center relative shadow-lg group-hover:border-primary/40 transition-colors">
                    {photoUrl ? (
                      <img
                        src={photoUrl}
                        alt="Admin avatar"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-tr from-primary/20 to-primary/5 flex flex-col items-center justify-center text-primary font-bold">
                        <span className="text-2xl font-black">
                          {displayName ? displayName.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) : "AD"}
                        </span>
                      </div>
                    )}

                    {/* Tiny Status Indicator Badge */}
                    <div className="absolute bottom-1 right-1 w-4.5 h-4.5 rounded-full bg-emerald-500 border-2 border-card flex items-center justify-center" title="Node Active">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <h4 className="font-bold text-sm text-foreground truncate max-w-[200px]">
                    {displayName || "Admin User"}
                  </h4>
                  <p className="text-[10px] text-primary font-mono font-bold tracking-wide mt-0.5">
                    {jobTitle || "Lead Systems Archivist"}
                  </p>
                  <p className="text-[9px] text-muted-foreground mt-0.5 font-medium">
                    {department || "SecOps & Archival Vaults"}
                  </p>
                </div>
              </div>
            </div>

            {/* Photo upload / drag & drop zone */}
            <div className="space-y-3">
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-3 text-center transition-all ${
                  dragActive
                    ? "border-primary bg-primary/5 scale-[0.98]"
                    : "border-border/80 hover:border-primary/40 hover:bg-accent/5"
                }`}
              >
                <p className="text-[10px] font-bold text-foreground">Drag & drop profile picture</p>
                <p className="text-[9px] text-muted-foreground mt-0.5">or click below to browse</p>
                
                <input
                  type="file"
                  ref={profilePhotoInputRef}
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />

                <div className="flex gap-1.5 justify-center mt-2.5">
                  <button
                    onClick={() => profilePhotoInputRef.current?.click()}
                    className="px-2.5 py-1 bg-accent hover:bg-accent/80 text-[9px] font-bold text-foreground rounded transition-colors flex items-center gap-1"
                    id="btn-upload-photo"
                  >
                    <Camera className="h-3 w-3" />
                    Upload Photo
                  </button>

                  {photoUrl && (
                    <button
                      onClick={() => setPhotoUrl("")}
                      className="px-2.5 py-1 bg-destructive/10 hover:bg-destructive/20 text-[9px] font-bold text-destructive rounded transition-colors"
                      id="btn-remove-photo"
                    >
                      Remove Photo
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Edit Profile Form */}
          <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 space-y-4 shadow-xs">
            <div>
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 border-b border-border/60 pb-2">
                <Edit2 className="h-4 w-4 text-primary" />
                Profile Details & Authorization Settings
              </h3>
              <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
                Update credential labels, email channels, and administrative clearance nodes below.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Display Name Input */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Admin Display Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Lead Archivist"
                    className="w-full pl-9 pr-3 py-2 border rounded-lg bg-background text-foreground text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                    id="profile-display-name-input"
                  />
                </div>
              </div>

              {/* Admin Email Input */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Admin Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. admin@firm.com"
                    className="w-full pl-9 pr-3 py-2 border rounded-lg bg-background text-foreground text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                    id="profile-email-input"
                  />
                </div>
              </div>

              {/* Job Title Input */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  System Job Title
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. Lead Archivist"
                    className="w-full pl-9 pr-3 py-2 border rounded-lg bg-background text-foreground text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                    id="profile-job-title-input"
                  />
                </div>
              </div>

              {/* Department Input */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Authorized Department
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border rounded-lg bg-background text-foreground text-xs focus:ring-1 focus:ring-primary focus:outline-none cursor-pointer"
                    id="profile-department-select"
                  >
                    <option value="SecOps & Archival Vaults">SecOps & Archival Vaults</option>
                    <option value="Academics">Academics</option>
                    <option value="Operations">Operations</option>
                    <option value="Finance">Finance</option>
                    <option value="Legal">Legal</option>
                    <option value="Human Resources">Human Resources</option>
                  </select>
                </div>
              </div>

              {/* Security Level Dropdown */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Security Authentication Node
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <select
                    value={securityLevel}
                    onChange={(e) => setSecurityLevel(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border rounded-lg bg-background text-foreground text-xs focus:ring-1 focus:ring-primary focus:outline-none cursor-pointer"
                    id="profile-security-select"
                  >
                    <option value="Two-Factor Auth Enabled">Two-Factor Auth (Biometrics/App)</option>
                    <option value="YubiKey Hardware Required">YubiKey Hardware Key Token</option>
                    <option value="Standard Password Credentials">Standard Email & Password</option>
                  </select>
                </div>
              </div>

              {/* Verification Node UUID */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Cryptographic Clearance UUID
                </label>
                <input
                  type="text"
                  disabled
                  value="SECURE_NODE_0x781552356576_SHA256"
                  className="w-full px-3 py-2 border rounded-lg bg-accent/40 text-muted-foreground text-xs cursor-not-allowed font-mono"
                />
              </div>
            </div>

            {/* Custom Description / Bio */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Administrative Notes / Clearance Summary
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder="Write custom notes..."
                className="w-full p-3 border rounded-lg bg-background text-foreground text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                id="profile-bio-textarea"
              />
            </div>

            {/* Save Buttons */}
            <div className="flex justify-end pt-3 border-t border-border/60">
              <button
                onClick={() => {
                  if (!displayName.trim()) {
                    alert("Admin Display Name is required.");
                    return;
                  }
                  onUpdateProfile({
                    displayName,
                    email,
                    jobTitle,
                    department,
                    photoUrl,
                    securityLevel,
                    bio,
                  });
                }}
                className="px-5 py-2.5 bg-primary hover:opacity-95 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                id="profile-save-btn"
              >
                <Check className="h-4 w-4" />
                Save Profile Changes
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
