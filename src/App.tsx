import React, { useState, useEffect, useMemo } from "react";
import { DocumentRecord, Theme } from "./types";
import { DashboardStats } from "./components/DashboardStats";
import { DocumentModal } from "./components/DocumentModal";
import { DocumentPreviewModal } from "./components/DocumentPreviewModal";
import { AddSignedDocumentView } from "./components/AddSignedDocumentView";
import { SignedReportView } from "./components/SignedReportView";
import { DataManagementView } from "./components/DataManagementView";
import {
  Search,
  Plus,
  Moon,
  Sun,
  Download,
  Upload,
  RefreshCw,
  Folder,
  SlidersHorizontal,
  Info,
  Globe,
  CheckCircle,
  FileSpreadsheet,
  LayoutDashboard,
  FileCheck,
  FilePlus,
  Database,
  Sliders,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Translation dictionaries
const translations = {
  en: {
    title: "Personal Signature Records",
    subtitle: "Digital logbook tracking all document signature histories and archival vaults.",
    searchPlaceholder: "Search document title, category, remarks...",
    addDocBtn: "Create Record",
    category: "Category",
    department: "Department",
    status: "Status",
    year: "Year",
    clearFilters: "Clear Filters",
    backupBtn: "Export JSON",
    exportCSV: "Export CSV",
    importBtn: "Import Backup",
    noRecords: "No documents match your filters. Try recording a new one!",
    loading: "Synchronizing secure digital vault...",
    updatedSuccess: "Record updated successfully",
    createdSuccess: "Record created successfully",
    deletedSuccess: "Record deleted successfully",
    auditLogged: "Audit trail verified",
    fileStorage: "Vault storage location verified",
    openSidebar: "Open Sidebar",
    closeSidebar: "Close Sidebar"
  },
  km: {
    title: "ប្រព័ន្ធគ្រប់គ្រងកំណត់ត្រាហត្ថលេខា",
    subtitle: "សៀវភៅកំណត់ហេតុឌីជីថលតាមដានប្រវត្តិហត្ថលេខាឯកសារ និងឃ្លាំងផ្ទុកបណ្ណសារ។",
    searchPlaceholder: "ស្វែងរកចំណងជើងឯកសារ ប្រភេទ កំណត់សម្គាល់...",
    addDocBtn: "បង្កើតកំណត់ត្រា",
    category: "ប្រភេទឯកសារ",
    department: "នាយកដ្ឋាន",
    status: "ស្ថានភាព",
    year: "ឆ្នាំ",
    clearFilters: "សម្អាតតម្រង",
    backupBtn: "នាំចេញទិន្នន័យ",
    exportCSV: "នាំចេញជា CSV",
    importBtn: "នាំចូលទិន្នន័យ",
    noRecords: "មិនមានឯកសារត្រូវនឹងតម្រងរបស់អ្នកទេ។ សាកល្បងបង្កើតថ្មី!",
    loading: "កំពុងធ្វើសមកាលកម្មឃ្លាំងឌីជីថលសុវត្ថិភាព...",
    updatedSuccess: "បានធ្វើបច្ចុប្បន្នភាពកំណត់ត្រាដោយជោគជ័យ",
    createdSuccess: "បានបង្កើតកំណត់ត្រាដោយជោគជ័យ",
    deletedSuccess: "បានលុបកំណត់ត្រាដោយជោគជ័យ",
    auditLogged: "បានផ្ទៀងផ្ទាត់គន្លងសវនកម្ម",
    fileStorage: "បានផ្ទៀងផ្ទាត់ទីតាំងផ្ទុកឯកសារ",
    openSidebar: "បើករបារចំហៀង",
    closeSidebar: "បិទរបារចំហៀង"
  },
};

export default function App() {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [language, setLanguage] = useState<"en" | "km">("en");
  const [theme, setTheme] = useState<Theme>("dark");

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  // Sidebar navigation state
  const [sidebarActiveItem, setSidebarActiveItem] = useState<string>(() => {
    return localStorage.getItem("signature-active-sidebar") || "dashboard";
  });
  const [sidebarExpanded, setSidebarExpanded] = useState<boolean>(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem("signature-active-sidebar", sidebarActiveItem);
  }, [sidebarActiveItem]);

  // Modal controls
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<DocumentRecord | null>(null);

  // Preview controls
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [viewingDocument, setViewingDocument] = useState<DocumentRecord | null>(null);

  // Status notifications
  const [toastMessage, setToastMessage] = useState("");

  const t = translations[language];

  // Load documents from backend
  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/documents");
      if (!response.ok) {
        throw new Error("Failed to load signature database records.");
      }
      const data = await response.json();
      setDocuments(data);
      localStorage.setItem("signature-documents", JSON.stringify(data));
      setError("");
    } catch (err: any) {
      console.warn("Express server not available, falling back to local storage:", err);
      const localDataStr = localStorage.getItem("signature-documents");
      if (localDataStr) {
        setDocuments(JSON.parse(localDataStr));
        setError("");
      } else {
        const seedData = [
          {
            id: "doc-1",
            documentName: "Visa Extension - Employee Renewal",
            recordDate: "2026-07-21",
            category: "Immigration / Visa",
            department: "HR",
            status: "Signed & Completed",
            storageLocation: "Google Drive - HR Folder",
            remarks: "Employee visa extension renewal document signed and uploaded for immigration processing.",
            createdBy: "westernassenmenttest@gmail.com",
            createdAt: "2026-07-21T00:00:00.000Z",
            updatedAt: "2026-07-21T00:00:00.000Z",
            auditLog: [
              {
                timestamp: "2026-07-21T00:00:00.000Z",
                action: "Created",
                changes: "Initial record created via Voice Input",
                user: "westernassenmenttest@gmail.com"
              }
            ]
          },
          {
            id: "doc-2",
            documentName: "Office Lease Agreement - Sector 4",
            recordDate: "2026-06-15",
            category: "Real Estate",
            department: "Operations",
            status: "Signed & Completed",
            storageLocation: "Physical File Cab - Drawer B",
            remarks: "Signed the 2-year renewal agreement for the main office floor. Monthly rent remains locked.",
            createdBy: "westernassenmenttest@gmail.com",
            createdAt: "2026-06-15T14:30:00.000Z",
            updatedAt: "2026-06-16T09:15:00.000Z",
            auditLog: [
              {
                timestamp: "2026-06-15T14:30:00.000Z",
                action: "Created",
                changes: "Initial record created",
                user: "westernassenmenttest@gmail.com"
              },
              {
                timestamp: "2026-06-16T09:15:00.000Z",
                action: "Updated",
                changes: "Changed storage location from 'Pending Scan' to 'Physical File Cab - Drawer B'",
                user: "westernassenmenttest@gmail.com"
              }
            ]
          },
          {
            id: "doc-3",
            documentName: "Software Consulting Service Agreement",
            recordDate: "2026-05-10",
            category: "Contract",
            department: "Legal",
            status: "Signed & Completed",
            storageLocation: "OneDrive - Contracts",
            remarks: "Service agreement with DevFlow Inc. for outsourcing backend infrastructure modernization.",
            createdBy: "westernassenmenttest@gmail.com",
            createdAt: "2026-05-10T10:00:00.000Z",
            updatedAt: "2026-05-10T10:00:00.000Z",
            auditLog: [
              {
                timestamp: "2026-05-10T10:00:00.000Z",
                action: "Created",
                changes: "Initial record created",
                user: "westernassenmenttest@gmail.com"
              }
            ]
          },
          {
            id: "doc-4",
            documentName: "Q2 Financial Statement Approval",
            recordDate: "2026-07-10",
            category: "Finance",
            department: "Finance",
            status: "Signed & Completed",
            storageLocation: "Google Drive - Finance Secure",
            remarks: "Board-approved financial statement summarizing the Q2 profits and expenditure.",
            createdBy: "westernassenmenttest@gmail.com",
            createdAt: "2026-07-10T16:45:00.000Z",
            updatedAt: "2026-07-10T16:45:00.000Z",
            auditLog: [
              {
                timestamp: "2026-07-10T16:45:00.000Z",
                action: "Created",
                changes: "Initial record created",
                user: "westernassenmenttest@gmail.com"
              }
            ]
          },
          {
            id: "doc-5",
            documentName: "NDAs for Product Team Onboarding",
            recordDate: "2026-07-01",
            category: "Legal",
            department: "HR",
            status: "Pending Review",
            storageLocation: "Local Storage - Pending Sync",
            remarks: "Draft non-disclosure agreements prepared for the upcoming July engineering batch.",
            createdBy: "westernassenmenttest@gmail.com",
            createdAt: "2026-07-01T09:00:00.000Z",
            updatedAt: "2026-07-01T09:00:00.000Z",
            auditLog: [
              {
                timestamp: "2026-07-01T09:00:00.000Z",
                action: "Created",
                changes: "Initial record created",
                user: "westernassenmenttest@gmail.com"
              }
            ]
          }
        ];
        setDocuments(seedData);
        localStorage.setItem("signature-documents", JSON.stringify(seedData));
        setError("");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();

    // Setup theme from localStorage
    const savedTheme = localStorage.getItem("signature-theme") as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      setTheme("dark"); // default to rich dark executive theme
    }

    // Language preference
    const savedLang = localStorage.getItem("signature-lang") as "en" | "km";
    if (savedLang) {
      setLanguage(savedLang);
    }
  }, []);

  // Update DOM classes when theme changes
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("signature-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const toggleLanguage = () => {
    const nextLang = language === "en" ? "km" : "en";
    setLanguage(nextLang);
    localStorage.setItem("signature-lang", nextLang);
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage("");
    }, 4000);
  };

  // Create or Update CRUD handler
  const handleSaveDocument = async (docData: Partial<DocumentRecord>) => {
    try {
      const isEditing = !!docData.id;
      const url = isEditing ? `/api/documents/${docData.id}` : "/api/documents";
      const method = isEditing ? "PUT" : "POST";

      let updatedRecord: DocumentRecord;
      try {
        const response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...docData,
            user: "westernassenmenttest@gmail.com", // signed-in tracking
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to save the signed document record via API.");
        }
        updatedRecord = await response.json();
      } catch (apiErr) {
        console.warn("API save failed, executing locally in offline mode:", apiErr);
        const nowStr = new Date().toISOString();
        if (isEditing) {
          const original = documents.find(d => d.id === docData.id);
          const oldLogs = original?.auditLog || [];
          
          const changes: string[] = [];
          const fields = ["documentName", "recordDate", "category", "department", "status", "storageLocation", "remarks"] as const;
          fields.forEach((field) => {
            if (docData[field] !== undefined && docData[field] !== (original?.[field] as any)) {
              changes.push(`Updated ${field} from "${original?.[field]}" to "${docData[field]}"`);
            }
          });

          const nextLogs = [...oldLogs];
          if (changes.length > 0) {
            nextLogs.push({
              timestamp: nowStr,
              action: "Updated",
              changes: changes.join("; ") + " (Offline Mode)",
              user: "westernassenmenttest@gmail.com"
            });
          }

          updatedRecord = {
            ...original,
            ...docData,
            updatedAt: nowStr,
            auditLog: nextLogs
          } as DocumentRecord;
        } else {
          updatedRecord = {
            id: docData.id || `doc-${Date.now()}`,
            documentName: docData.documentName || "Untitled Document",
            recordDate: docData.recordDate || nowStr.split("T")[0],
            category: docData.category || "General",
            department: docData.department || "General",
            status: docData.status || "Signed & Completed",
            storageLocation: docData.storageLocation || "Google Drive",
            remarks: docData.remarks || "",
            createdBy: "westernassenmenttest@gmail.com",
            createdAt: nowStr,
            updatedAt: nowStr,
            auditLog: [
              {
                timestamp: nowStr,
                action: "Created",
                changes: "Record created manually (Offline Mode)",
                user: "westernassenmenttest@gmail.com"
              }
            ]
          } as DocumentRecord;
        }
      }

      let nextDocs: DocumentRecord[];
      if (isEditing) {
        nextDocs = documents.map((d) => (d.id === updatedRecord.id ? updatedRecord : d));
        setDocuments(nextDocs);
        showToast(t.updatedSuccess);
      } else {
        nextDocs = [updatedRecord, ...documents];
        setDocuments(nextDocs);
        showToast(t.createdSuccess);
        if (sidebarActiveItem === "add") {
          setSidebarActiveItem("reports");
        }
      }
      localStorage.setItem("signature-documents", JSON.stringify(nextDocs));
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Could not synchronize record database.");
    }
  };

  // Delete CRUD handler
  const handleDeleteDocument = async (id: string) => {
    if (!window.confirm(language === "en" ? "Are you sure you want to permanently delete this signature record?" : "តើអ្នកប្រាកដជាចង់លុបកំណត់ត្រាហត្ថលេខានេះជាអចិន្ត្រៃយ៍មែនទេ?")) {
      return;
    }

    try {
      try {
        const response = await fetch(`/api/documents/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete the signature record via API.");
        }
      } catch (apiErr) {
        console.warn("API delete failed, executing locally in offline mode:", apiErr);
      }

      const nextDocs = documents.filter((d) => d.id !== id);
      setDocuments(nextDocs);
      localStorage.setItem("signature-documents", JSON.stringify(nextDocs));
      showToast(t.deletedSuccess);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "An error occurred during deletion.");
    }
  };

  // Edit action
  const handleTriggerEdit = (doc: DocumentRecord) => {
    setEditingDocument(doc);
    setIsModalOpen(true);
  };

  // View action
  const handleTriggerView = (doc: DocumentRecord) => {
    setViewingDocument(doc);
    setIsPreviewOpen(true);
  };

  // Create action
  const handleTriggerCreate = () => {
    setEditingDocument(null);
    setIsModalOpen(true);
  };

  // Sidebar item handler
  const handleSidebarClick = (item: string) => {
    if (item === "dashboard") {
      setSidebarActiveItem("dashboard");
      setSelectedStatus("");
      setSelectedCategory("");
      setSelectedDepartment("");
      setSelectedYear("");
      setSearchQuery("");
    } else if (item === "add") {
      setSidebarActiveItem("add");
    } else if (item === "reports") {
      setSidebarActiveItem("reports");
      setSelectedStatus(""); // show all recorded documents by default
      setSelectedCategory("");
      setSelectedDepartment("");
      setSelectedYear("");
      setSearchQuery("");
    } else if (item === "data") {
      setSidebarActiveItem("data");
    }
    setMobileSidebarOpen(false);
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedDepartment("");
    setSelectedStatus("");
    setSelectedYear("");
  };

  // Backup Download API
  const handleExportBackup = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(documents, null, 2)
    )}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", `signed_documents_backup_${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Export Filtered Documents list in CSV format
  const handleExportCSV = (customDocs?: DocumentRecord[]) => {
    const headers = [
      "Document ID",
      "Document Name",
      "Record Date",
      "Category",
      "Department",
      "Status",
      "Storage Location",
      "Remarks",
      "Created By",
      "Created At",
      "Updated At"
    ];

    const escapeCSVValue = (val: any) => {
      if (val === null || val === undefined) return "";
      let str = String(val);
      str = str.replace(/"/g, '""');
      if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
        return `"${str}"`;
      }
      return str;
    };

    const csvRows = [];
    csvRows.push(headers.join(","));

    const docsToExport = customDocs || filteredDocuments;

    for (const doc of docsToExport) {
      const row = [
        doc.id,
        doc.documentName,
        doc.recordDate,
        doc.category,
        doc.department,
        doc.status,
        doc.storageLocation,
        doc.remarks,
        doc.createdBy,
        doc.createdAt,
        doc.updatedAt
      ];
      csvRows.push(row.map(escapeCSVValue).join(","));
    }

    const csvContent = csvRows.join("\n");
    // Using BOM to support UTF-8 in Excel
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", url);
    downloadAnchor.setAttribute("download", `signed_documents_filtered_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    URL.revokeObjectURL(url);
  };

  // Import Backup Handler
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const file = e.target.files?.[0];
    if (!file) return;

    fileReader.onload = async (event) => {
      try {
        const parsedData = JSON.parse(event.target?.result as string);
        if (!Array.isArray(parsedData)) {
          throw new Error("Invalid backup format. Must be an array of documents.");
        }

        // Send each imported item to backend or bulk-write
        // For simplicity and client-friendliness, we can batch update the database
        // We can upload it and get server status
        alert(language === "en" ? "Backup data read successfully! Merging records..." : "អានទិន្នន័យបម្រុងទុកដោយជោគជ័យ! កំពុងបញ្ចូលកំណត់ត្រា...");
        
        // Let's recursively merge to backend or write manually
        for (const doc of parsedData) {
          // clean up fields and save
          await handleSaveDocument(doc);
        }
        fetchDocuments();
      } catch (err) {
        alert("Failed to parse backup file. Please ensure it is a valid JSON backup.");
      }
    };
    fileReader.readAsText(file);
  };

  // Batch Import / Restore
  const handleImportBackupBatch = async (importedDocs: DocumentRecord[]) => {
    try {
      setLoading(true);
      const nextDocs = [...documents];
      for (const doc of importedDocs) {
        try {
          await fetch("/api/documents", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(doc),
          });
        } catch (apiErr) {
          console.warn("API batch restore failed for doc, executing offline:", doc.id, apiErr);
        }
        if (!nextDocs.some(d => d.id === doc.id)) {
          nextDocs.unshift(doc);
        }
      }
      setDocuments(nextDocs);
      localStorage.setItem("signature-documents", JSON.stringify(nextDocs));
      showToast("Archival database merged successfully");
    } catch (err) {
      console.error(err);
      alert("Error occurred while restoring records.");
    } finally {
      setLoading(false);
    }
  };

  // Bulk Delete
  const handleBulkDelete = async (ids: string[]) => {
    try {
      setLoading(true);
      try {
        const response = await fetch("/api/documents/bulk-delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids }),
        });
        if (!response.ok) throw new Error("Bulk delete action failed.");
      } catch (apiErr) {
        console.warn("API bulk delete failed, executing offline:", apiErr);
      }

      const nextDocs = documents.filter((doc) => !ids.includes(doc.id));
      setDocuments(nextDocs);
      localStorage.setItem("signature-documents", JSON.stringify(nextDocs));
      showToast(`Pruned ${ids.length} signature records`);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Error occurred during bulk deletion.");
    } finally {
      setLoading(false);
    }
  };

  // Reset Master Database
  const handleResetData = async () => {
    try {
      setLoading(true);
      try {
        const response = await fetch("/api/documents/reset", {
          method: "POST",
        });
        if (!response.ok) throw new Error("Database reset operation failed.");
      } catch (apiErr) {
        console.warn("API reset failed, executing offline:", apiErr);
      }

      const seedData = [
        {
          id: "doc-1",
          documentName: "Visa Extension - Employee Renewal",
          recordDate: "2026-07-21",
          category: "Immigration / Visa",
          department: "HR",
          status: "Signed & Completed",
          storageLocation: "Google Drive - HR Folder",
          remarks: "Employee visa extension renewal document signed and uploaded for immigration processing.",
          createdBy: "westernassenmenttest@gmail.com",
          createdAt: "2026-07-21T00:00:00.000Z",
          updatedAt: "2026-07-21T00:00:00.000Z",
          auditLog: [
            {
              timestamp: "2026-07-21T00:00:00.000Z",
              action: "Created",
              changes: "Initial record created via Voice Input",
              user: "westernassenmenttest@gmail.com"
            }
          ]
        },
        {
          id: "doc-2",
          documentName: "Office Lease Agreement - Sector 4",
          recordDate: "2026-06-15",
          category: "Real Estate",
          department: "Operations",
          status: "Signed & Completed",
          storageLocation: "Physical File Cab - Drawer B",
          remarks: "Signed the 2-year renewal agreement for the main office floor. Monthly rent remains locked.",
          createdBy: "westernassenmenttest@gmail.com",
          createdAt: "2026-06-15T14:30:00.000Z",
          updatedAt: "2026-06-16T09:15:00.000Z",
          auditLog: [
            {
              timestamp: "2026-06-15T14:30:00.000Z",
              action: "Created",
              changes: "Initial record created",
              user: "westernassenmenttest@gmail.com"
            },
            {
              timestamp: "2026-06-16T09:15:00.000Z",
              action: "Updated",
              changes: "Changed storage location from 'Pending Scan' to 'Physical File Cab - Drawer B'",
              user: "westernassenmenttest@gmail.com"
            }
          ]
        },
        {
          id: "doc-3",
          documentName: "Software Consulting Service Agreement",
          recordDate: "2026-05-10",
          category: "Contract",
          department: "Legal",
          status: "Signed & Completed",
          storageLocation: "OneDrive - Contracts",
          remarks: "Service agreement with DevFlow Inc. for outsourcing backend infrastructure modernization.",
          createdBy: "westernassenmenttest@gmail.com",
          createdAt: "2026-05-10T10:00:00.000Z",
          updatedAt: "2026-05-10T10:00:00.000Z",
          auditLog: [
            {
              timestamp: "2026-05-10T10:00:00.000Z",
              action: "Created",
              changes: "Initial record created",
              user: "westernassenmenttest@gmail.com"
            }
          ]
        },
        {
          id: "doc-4",
          documentName: "Q2 Financial Statement Approval",
          recordDate: "2026-07-10",
          category: "Finance",
          department: "Finance",
          status: "Signed & Completed",
          storageLocation: "Google Drive - Finance Secure",
          remarks: "Board-approved financial statement summarizing the Q2 profits and expenditure.",
          createdBy: "westernassenmenttest@gmail.com",
          createdAt: "2026-07-10T16:45:00.000Z",
          updatedAt: "2026-07-10T16:45:00.000Z",
          auditLog: [
            {
              timestamp: "2026-07-10T16:45:00.000Z",
              action: "Created",
              changes: "Initial record created",
              user: "westernassenmenttest@gmail.com"
            }
          ]
        },
        {
          id: "doc-5",
          documentName: "NDAs for Product Team Onboarding",
          recordDate: "2026-07-01",
          category: "Legal",
          department: "HR",
          status: "Pending Review",
          storageLocation: "Local Storage - Pending Sync",
          remarks: "Draft non-disclosure agreements prepared for the upcoming July engineering batch.",
          createdBy: "westernassenmenttest@gmail.com",
          createdAt: "2026-07-01T09:00:00.000Z",
          updatedAt: "2026-07-01T09:00:00.000Z",
          auditLog: [
            {
              timestamp: "2026-07-01T09:00:00.000Z",
              action: "Created",
              changes: "Initial record created",
              user: "westernassenmenttest@gmail.com"
            }
          ]
        }
      ];
      setDocuments(seedData);
      localStorage.setItem("signature-documents", JSON.stringify(seedData));
      showToast("Restored template seeds database");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Error resetting database.");
    } finally {
      setLoading(false);
    }
  };

  // Extract unique years from document list
  const uniqueYears = Array.from(
    new Set<string>(
      documents
        .map((doc) => {
          if (!doc.recordDate) return "";
          return doc.recordDate.split("-")[0];
        })
        .filter((y): y is string => y !== "")
    )
  ).sort((a, b) => b.localeCompare(a));

  // Extract unique departments and categories dynamically
  const uniqueDepartments = Array.from(new Set(documents.map((d) => d.department))).filter(Boolean);
  const uniqueCategories = Array.from(new Set(documents.map((d) => d.category))).filter(Boolean);

  // Apply Search and Filters
  const filteredDocuments = documents.filter((doc) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      doc.documentName.toLowerCase().includes(query) ||
      (doc.remarks && doc.remarks.toLowerCase().includes(query)) ||
      doc.category.toLowerCase().includes(query) ||
      doc.department.toLowerCase().includes(query) ||
      doc.id.toLowerCase().includes(query) ||
      (doc.createdBy && doc.createdBy.toLowerCase().includes(query)) ||
      (doc.storageLocation && doc.storageLocation.toLowerCase().includes(query));

    const matchesCategory = !selectedCategory || doc.category === selectedCategory;
    const matchesDepartment = !selectedDepartment || doc.department === selectedDepartment;
    const matchesStatus = !selectedStatus || doc.status === selectedStatus;
    const matchesYear = !selectedYear || (doc.recordDate && doc.recordDate.startsWith(selectedYear));

    return matchesSearch && matchesCategory && matchesDepartment && matchesStatus && matchesYear;
  });

  // Aggregated recent activity logs from all documents
  const recentActivities = useMemo(() => {
    const list: Array<{ docName: string; timestamp: string; action: string; changes: string; user: string }> = [];
    documents.forEach((doc) => {
      if (doc.auditLog) {
        doc.auditLog.forEach((log) => {
          list.push({
            docName: doc.documentName,
            timestamp: log.timestamp,
            action: log.action,
            changes: log.changes,
            user: log.user,
          });
        });
      }
    });
    // Sort descending
    list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return list.slice(0, 5); // show top 5 recent activities
  }, [documents]);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 flex flex-col md:flex-row">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-3 rounded-full shadow-2xl bg-primary text-white border border-primary/20 text-xs font-semibold"
            id="toast-notification"
          >
            <CheckCircle className="h-4 w-4 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Off-Canvas Drawer (Slide-out menu overlay and container) */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
              className="fixed inset-0 bg-black z-50 md:hidden"
            />
            {/* Slide-out Sidebar Panel */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="fixed top-0 left-0 bottom-0 w-64 bg-[#0F172A] text-slate-100 p-4 z-50 flex flex-col justify-between shadow-2xl md:hidden"
            >
              <div className="space-y-6">
                {/* Mobile Drawer Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-primary rounded flex items-center justify-center font-bold text-white text-xs shrink-0">SL</div>
                    <div>
                      <span className="text-sm font-bold tracking-tight">SignLog<span className="text-primary text-[9px] ml-0.5">PRO</span></span>
                      <span className="block text-[8px] text-slate-400 font-mono">SECURE VAULT v2.0</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setMobileSidebarOpen(false)}
                    className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
                    title={t.closeSidebar}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Mobile Navigation Items */}
                <nav className="space-y-1.5">
                  <button
                    onClick={() => handleSidebarClick("dashboard")}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-[11px] font-bold tracking-wide transition-all uppercase text-left ${
                      sidebarActiveItem === "dashboard"
                        ? "bg-primary text-white font-black"
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    <LayoutDashboard className="h-4 w-4 text-primary shrink-0" />
                    <span>Dashboard Overview</span>
                  </button>

                  <button
                    onClick={() => handleSidebarClick("add")}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-[11px] font-bold tracking-wide transition-all uppercase text-left ${
                      sidebarActiveItem === "add"
                        ? "bg-primary text-white font-black"
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    <FilePlus className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Add Signed Document</span>
                  </button>

                  <button
                    onClick={() => handleSidebarClick("reports")}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-[11px] font-bold tracking-wide transition-all uppercase text-left ${
                      sidebarActiveItem === "reports"
                        ? "bg-primary text-white font-black"
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    <FileCheck className="h-4 w-4 text-amber-400 shrink-0" />
                    <span>Signed Report</span>
                  </button>

                  <button
                    onClick={() => handleSidebarClick("data")}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-[11px] font-bold tracking-wide transition-all uppercase text-left ${
                      sidebarActiveItem === "data"
                        ? "bg-primary text-white font-black"
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    <Database className="h-4 w-4 text-blue-400 shrink-0" />
                    <span>Data Management</span>
                  </button>
                </nav>
              </div>

              {/* Mobile Drawer Footer */}
              <div className="pt-3 border-t border-slate-800 text-[10px] text-slate-500 space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <p className="truncate">Database: Live Sync</p>
                </div>
                <p className="text-[8px] text-slate-600 font-mono">UUID: NODE_SECURE_0x9F</p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Sidebar - Desktop (sticky, height full, collapsible) */}
      <aside className={`hidden md:flex md:flex-col ${sidebarExpanded ? "md:w-60 lg:w-64" : "md:w-16"} bg-[#0F172A] text-slate-100 p-4 border-r border-slate-800 shrink-0 h-screen sticky top-0 justify-between transition-all duration-300`}>
        <div className="space-y-6">
          {/* Sidebar Header */}
          <div className={`flex items-center ${sidebarExpanded ? "justify-between" : "justify-center"} px-1`}>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-primary rounded flex items-center justify-center font-bold text-white text-xs shrink-0">SL</div>
              {sidebarExpanded && (
                <div>
                  <span className="text-sm font-bold tracking-tight">SignLog<span className="text-primary text-[9px] ml-0.5">PRO</span></span>
                  <span className="block text-[8px] text-slate-400 font-mono">SECURE VAULT v2.0</span>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5">
            <button
              onClick={() => handleSidebarClick("dashboard")}
              title={!sidebarExpanded ? "Dashboard Overview" : undefined}
              className={`w-full flex items-center ${sidebarExpanded ? "gap-2.5 px-3 py-2" : "justify-center p-2"} rounded text-[11px] font-bold tracking-wide transition-all uppercase text-left ${
                sidebarActiveItem === "dashboard"
                  ? "bg-primary text-white font-black"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <LayoutDashboard className="h-4 w-4 text-primary shrink-0" />
              {sidebarExpanded && <span>Dashboard Overview</span>}
            </button>

            <button
              onClick={() => handleSidebarClick("add")}
              title={!sidebarExpanded ? "Add Signed Document" : undefined}
              className={`w-full flex items-center ${sidebarExpanded ? "gap-2.5 px-3 py-2" : "justify-center p-2"} rounded text-[11px] font-bold tracking-wide transition-all uppercase text-left ${
                sidebarActiveItem === "add"
                  ? "bg-primary text-white font-black"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <FilePlus className="h-4 w-4 text-emerald-400 shrink-0" />
              {sidebarExpanded && <span>Add Signed Document</span>}
            </button>

            <button
              onClick={() => handleSidebarClick("reports")}
              title={!sidebarExpanded ? "Signed Report" : undefined}
              className={`w-full flex items-center ${sidebarExpanded ? "gap-2.5 px-3 py-2" : "justify-center p-2"} rounded text-[11px] font-bold tracking-wide transition-all uppercase text-left ${
                sidebarActiveItem === "reports"
                  ? "bg-primary text-white font-black"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <FileCheck className="h-4 w-4 text-amber-400 shrink-0" />
              {sidebarExpanded && <span>Signed Report</span>}
            </button>

            <button
              onClick={() => handleSidebarClick("data")}
              title={!sidebarExpanded ? "Data Management" : undefined}
              className={`w-full flex items-center ${sidebarExpanded ? "gap-2.5 px-3 py-2" : "justify-center p-2"} rounded text-[11px] font-bold tracking-wide transition-all uppercase text-left ${
                sidebarActiveItem === "data"
                  ? "bg-primary text-white font-black"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Database className="h-4 w-4 text-blue-400 shrink-0" />
              {sidebarExpanded && <span>Data Management</span>}
            </button>
          </nav>
        </div>

        {/* Sidebar Footer with Collapse/Expand Action Button */}
        <div className="space-y-3 pt-3 border-t border-slate-800">
          {/* Collapse Sidebar Toggle Action */}
          <button
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            className={`w-full flex items-center ${sidebarExpanded ? "justify-start gap-2.5 px-3 py-2" : "justify-center p-2"} rounded text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer`}
            title={sidebarExpanded ? t.closeSidebar : t.openSidebar}
            id="sidebar-desktop-toggle-btn"
          >
            {sidebarExpanded ? (
              <>
                <ChevronLeft className="h-4 w-4 text-slate-400" />
                <span>{t.closeSidebar}</span>
              </>
            ) : (
              <ChevronRight className="h-4 w-4 text-slate-400" />
            )}
          </button>

          {sidebarExpanded && (
            <div className="text-[10px] text-slate-500 space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <p className="truncate">Database: Live Sync</p>
              </div>
              <p className="text-[8px] text-slate-600 font-mono">UUID: NODE_SECURE_0x9F</p>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Top Navigation */}
      <div className="flex md:hidden flex-col bg-[#0F172A] text-slate-100 px-4 py-2.5 border-b border-slate-800 sticky top-0 z-40">
        <div className="flex items-center justify-between mb-2.5">
          {/* Menu Drawer Toggle Button */}
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-1.5 -ml-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-all flex items-center gap-1 cursor-pointer"
            title={t.openSidebar}
            id="sidebar-mobile-open-btn"
          >
            <Menu className="h-5 w-5 shrink-0" />
            <span className="text-[10px] uppercase font-bold tracking-wider">{t.openSidebar}</span>
          </button>

          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center font-bold text-white text-[11px]">SL</div>
            <span className="text-xs font-bold tracking-tight">SignLog<span className="text-primary text-[9px] ml-0.5">PRO</span></span>
          </div>
          
          <div className="text-[9px] text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span>Online</span>
          </div>
        </div>

        {/* Horizontal scroll tabs for mobile */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
          <button
            onClick={() => handleSidebarClick("dashboard")}
            className={`px-3 py-1 rounded text-[10px] font-bold shrink-0 uppercase tracking-wider transition-colors ${
              sidebarActiveItem === "dashboard" ? "bg-primary text-white" : "bg-slate-800/80 text-slate-400"
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => handleSidebarClick("add")}
            className="px-3 py-1 rounded text-[10px] font-bold shrink-0 bg-slate-800/80 text-slate-400 uppercase tracking-wider"
          >
            + Add Doc
          </button>
          <button
            onClick={() => handleSidebarClick("reports")}
            className={`px-3 py-1 rounded text-[10px] font-bold shrink-0 uppercase tracking-wider transition-colors ${
              sidebarActiveItem === "reports" ? "bg-primary text-white" : "bg-slate-800/80 text-slate-400"
            }`}
          >
            Signed Report
          </button>
          <button
            onClick={() => handleSidebarClick("data")}
            className={`px-3 py-1 rounded text-[10px] font-bold shrink-0 uppercase tracking-wider transition-colors ${
              sidebarActiveItem === "data" ? "bg-primary text-white" : "bg-slate-800/80 text-slate-400"
            }`}
          >
            Data Management
          </button>
        </div>
      </div>

      {/* Main Content Pane */}
      <div className="flex-1 overflow-y-auto max-h-screen">
        {/* Main Container */}
        <div className="w-full max-w-7xl mx-auto px-4 py-5">
        
        {/* Header Block */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-6 pb-4 border-b border-border">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg md:text-xl font-extrabold tracking-tight text-foreground font-sans uppercase">
                {t.title}
              </h1>
              <span className="hidden sm:inline-flex px-1.5 py-0.5 border border-primary/20 bg-primary/10 text-primary text-[9px] rounded font-bold tracking-wider uppercase font-mono">
                SECURE VAULT v2.0
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5 max-w-2xl leading-relaxed">
              {t.subtitle}
            </p>
          </div>

          {/* Quick Actions Row (Theme, Lang, Create, Sync) */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Lang Button */}
            <button
              onClick={toggleLanguage}
              className="px-2.5 py-1.5 border rounded-md hover:bg-accent text-foreground transition-all duration-200 flex items-center gap-1 text-xs font-semibold cursor-pointer"
              title="Toggle Language / ប្តូរភាសា"
              id="lang-toggle-btn"
            >
              <Globe className="h-3.5 w-3.5 text-primary" />
              <span>{language === "en" ? "ខ្មែរ" : "EN"}</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 border rounded-md hover:bg-accent text-foreground transition-all duration-200 cursor-pointer"
              title="Toggle Theme"
              id="theme-toggle-btn"
            >
              {theme === "dark" ? (
                <Sun className="h-3.5 w-3.5 text-amber-400" />
              ) : (
                <Moon className="h-3.5 w-3.5 text-slate-700" />
              )}
            </button>

            {/* Sync Database */}
            <button
              onClick={fetchDocuments}
              className="p-1.5 border rounded-md hover:bg-accent text-foreground transition-all duration-200 cursor-pointer"
              title="Sync Database"
            >
              <RefreshCw className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
            </button>

            {/* Create Record Button */}
            <button
              onClick={handleTriggerCreate}
              className="px-3 py-1.5 bg-primary text-white font-semibold rounded-md text-xs hover:opacity-95 transition-all duration-150 flex items-center gap-1 cursor-pointer shadow-xs ml-auto sm:ml-0"
              id="create-record-btn"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{t.addDocBtn}</span>
            </button>
          </div>
        </header>

        {/* Active Sidebar Tab Banner/Controls */}
        {sidebarActiveItem === "reports" && (
          <div className="mb-5 p-3.5 border border-amber-500/20 bg-amber-500/5 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 text-amber-500 rounded">
                <FileCheck className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">Signed Document Ledger Report</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">Filter automatically optimized for "Signed & Completed" verification records.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button 
                onClick={handleExportCSV}
                className="w-full sm:w-auto px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[10px] rounded flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                id="report-download-csv"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                <span>Download Report (CSV)</span>
              </button>
            </div>
          </div>
        )}

        {sidebarActiveItem === "data" && (
          <div className="mb-5 p-3.5 border border-blue-500/20 bg-blue-500/5 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 text-blue-500 rounded">
                <Database className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">Data Administration Console</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">Secure operations to sync database node, import backup files, or export current snapshots.</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <button 
                onClick={handleExportBackup}
                className="flex-1 sm:flex-none px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[10px] rounded flex items-center justify-center gap-1 cursor-pointer transition-colors"
              >
                <Download className="h-3 w-3" />
                <span>Export Backup (JSON)</span>
              </button>
              <label className="flex-1 sm:flex-none px-2.5 py-1.5 border border-blue-500/30 hover:bg-blue-500/10 text-blue-500 font-semibold text-[10px] rounded flex items-center justify-center gap-1 cursor-pointer transition-colors">
                <Upload className="h-3 w-3" />
                <span>Import Backup</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportBackup}
                  className="hidden"
                />
              </label>
              <button 
                onClick={fetchDocuments}
                className="px-2.5 py-1.5 border border-slate-500/30 hover:bg-slate-500/10 text-muted-foreground hover:text-foreground font-semibold text-[10px] rounded flex items-center justify-center gap-1 cursor-pointer transition-colors"
                title="Sync Nodes"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Sync Node</span>
              </button>
            </div>
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div className="p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-2xl text-xs mb-6 flex items-center gap-3">
            <Info className="h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">Connection Error</p>
              <p className="mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Active View Router */}
        {sidebarActiveItem === "add" ? (
          <AddSignedDocumentView
            onSave={handleSaveDocument}
            language={language}
            userEmail="westernassenmenttest@gmail.com"
          />
        ) : sidebarActiveItem === "reports" ? (
          <SignedReportView
            documents={documents}
            onView={handleTriggerView}
            onEdit={handleTriggerEdit}
            onDelete={handleDeleteDocument}
            onExportCSV={handleExportCSV}
            language={language}
          />
        ) : sidebarActiveItem === "data" ? (
          <DataManagementView
            documents={documents}
            onImportBackup={handleImportBackupBatch}
            onExportJSON={handleExportBackup}
            onExportCSV={handleExportCSV}
            onResetData={handleResetData}
            onBulkDelete={handleBulkDelete}
            language={language}
          />
        ) : (
          /* Dashboard Overview */
          <div className="space-y-6">
            {!loading && (
              <DashboardStats
                documents={documents}
                onSelectCategory={(cat) => setSelectedCategory(cat)}
                selectedCategory={selectedCategory}
              />
            )}

            {/* Simple Dashboard Controls: Search, Export JSON, Export CSV */}
            <div className="bg-card border rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-3 bg-primary rounded-full shrink-0" />
                    Search & Operations Console
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Find specific signature records or instantly export reports in JSON/CSV formats
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  {/* Export JSON Button */}
                  <button
                    onClick={handleExportBackup}
                    className="flex-1 md:flex-none px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow-md transition-all duration-150"
                    title="Export all records to JSON backup format"
                    id="dashboard-export-json"
                  >
                    <Download className="h-4 w-4" />
                    <span>Export JSON</span>
                  </button>

                  {/* Export CSV Button */}
                  <button
                    onClick={() => handleExportCSV()}
                    className="flex-1 md:flex-none px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow-md transition-all duration-150"
                    title="Export filtered records to standard CSV sheet"
                    id="dashboard-export-csv"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* The Search input */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search documents by title, employee name, document number, storage location, or remarks..."
                  className="w-full pl-10 pr-4 py-2.5 border rounded-lg bg-background text-foreground text-xs focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none placeholder:text-muted-foreground/60 shadow-inner"
                  id="search-input"
                />
              </div>

              {/* Filters Info and Reset */}
              {searchQuery && (
                <div className="flex justify-between items-center bg-accent/20 px-3.5 py-2 rounded-lg text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <SlidersHorizontal className="h-3.5 w-3.5 text-primary" />
                    Active Search. Found <strong className="text-foreground">{filteredDocuments.length}</strong> matching records.
                  </span>
                  <button
                    onClick={handleResetFilters}
                    className="text-primary hover:underline font-semibold"
                  >
                    {t.clearFilters}
                  </button>
                </div>
              )}
            </div>

            {/* Signed Reports Digital Ledger */}
            <main className="bg-card border rounded-xl shadow-xs overflow-hidden">
              <div className="px-5 py-4 border-b border-border/60 bg-accent/5 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Signed Documents Report Ledger
                  </h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Live digital ledger tracking certified signature transactions
                  </p>
                </div>
                <div className="text-[11px] font-medium text-muted-foreground bg-accent/20 px-2.5 py-1 rounded-md">
                  Showing {filteredDocuments.length} of {documents.length} records
                </div>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <RefreshCw className="h-8 w-8 text-primary animate-spin" />
                  <p className="text-xs text-muted-foreground font-semibold">{t.loading}</p>
                </div>
              ) : filteredDocuments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center p-8">
                  <Folder className="h-12 w-12 text-muted-foreground opacity-50 mb-3" />
                  <h3 className="text-sm font-bold text-foreground">No Records Found</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mt-1 leading-relaxed">
                    {t.noRecords}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse" id="dashboard-ledger-table">
                    <thead>
                      <tr className="border-b border-border bg-accent/10 text-muted-foreground text-[10px] uppercase font-bold tracking-wider">
                        <th className="px-5 py-3">Doc ID</th>
                        <th className="px-5 py-3">Document Name</th>
                        <th className="px-5 py-3">Date</th>
                        <th className="px-5 py-3">Category</th>
                        <th className="px-5 py-3">Department</th>
                        <th className="px-5 py-3">Status</th>
                        <th className="px-5 py-3">Storage Location</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50 text-xs">
                      {filteredDocuments.map((doc, idx) => (
                        <tr 
                          key={doc.id}
                          className="hover:bg-accent/10 transition-colors"
                        >
                          <td className="px-5 py-3.5 font-mono text-[10px] font-bold text-muted-foreground">
                            {doc.id}
                          </td>
                          <td className="px-5 py-3.5 font-semibold text-foreground">
                            {doc.documentName}
                          </td>
                          <td className="px-5 py-3.5 text-muted-foreground whitespace-nowrap">
                            {doc.recordDate}
                          </td>
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            <span className="px-2 py-1 bg-accent text-accent-foreground rounded text-[10px] font-medium">
                              {doc.category}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-muted-foreground whitespace-nowrap">
                            {doc.department}
                          </td>
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              doc.status === "Signed & Completed" 
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                                : doc.status === "Pending Review"
                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                doc.status === "Signed & Completed" 
                                  ? "bg-emerald-500" 
                                  : doc.status === "Pending Review"
                                  ? "bg-amber-500"
                                  : "bg-blue-500"
                              }`} />
                              {doc.status}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-muted-foreground">
                            {doc.storageLocation}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </main>
          </div>
        )}
      </div>
    </div>

      {/* Unified Voice & Manual Entry Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <DocumentModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSaveDocument}
            editingDocument={editingDocument}
          />
        )}
      </AnimatePresence>

      {/* Document Detail Preview Modal */}
      <AnimatePresence>
        {isPreviewOpen && viewingDocument && (
          <DocumentPreviewModal
            isOpen={isPreviewOpen}
            onClose={() => setIsPreviewOpen(false)}
            document={viewingDocument}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
