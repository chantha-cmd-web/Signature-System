import React, { useState, useMemo } from "react";
import { DocumentRecord } from "../types";
import {
  Search,
  Eye,
  Edit,
  Trash2,
  Printer,
  FileSpreadsheet,
  FileDown,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
  FileText,
  Calendar,
  Building2,
  FolderDot,
  UserCheck
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SignedReportViewProps {
  documents: DocumentRecord[];
  onView: (doc: DocumentRecord) => void;
  onEdit: (doc: DocumentRecord) => void;
  onDelete: (id: string) => void;
  onExportCSV: (filtered: DocumentRecord[]) => void;
  language: "en" | "km";
}

type SortField = "documentName" | "recordDate" | "createdBy" | "category" | "department" | "status";
type SortDirection = "asc" | "desc";

export const SignedReportView: React.FC<SignedReportViewProps> = ({
  documents,
  onView,
  onEdit,
  onDelete,
  onExportCSV,
  language,
}) => {
  // Advanced Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedSubmitter, setSelectedSubmitter] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Sorting states
  const [sortField, setSortField] = useState<SortField>("recordDate");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Get list of unique submitters
  const uniqueSubmitters = useMemo(() => {
    const list = documents.map(d => d.createdBy || "System");
    return Array.from(new Set(list)).filter(Boolean);
  }, [documents]);

  // Get list of unique categories
  const uniqueCategories = useMemo(() => {
    const list = documents.map(d => d.category);
    return Array.from(new Set(list)).filter(Boolean);
  }, [documents]);

  // Get list of unique departments
  const uniqueDepartments = useMemo(() => {
    const list = documents.map(d => d.department);
    return Array.from(new Set(list)).filter(Boolean);
  }, [documents]);

  // Handle Sort Change
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Reset Filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedStatus("");
    setSelectedSubmitter("");
    setSelectedCategory("");
    setSelectedDepartment("");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  };

  // Filter documents
  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      // search
      const textToSearch = `${doc.documentName} ${doc.category} ${doc.department} ${doc.remarks || ""} ${doc.createdBy || ""}`.toLowerCase();
      if (searchTerm && !textToSearch.includes(searchTerm.toLowerCase())) {
        return false;
      }

      // status
      if (selectedStatus && doc.status !== selectedStatus) {
        return false;
      }

      // submitter
      if (selectedSubmitter && (doc.createdBy || "System") !== selectedSubmitter) {
        return false;
      }

      // category
      if (selectedCategory && doc.category !== selectedCategory) {
        return false;
      }

      // department
      if (selectedDepartment && doc.department !== selectedDepartment) {
        return false;
      }

      // start date
      if (startDate && doc.recordDate < startDate) {
        return false;
      }

      // end date
      if (endDate && doc.recordDate > endDate) {
        return false;
      }

      return true;
    });
  }, [documents, searchTerm, selectedStatus, selectedSubmitter, selectedCategory, selectedDepartment, startDate, endDate]);

  // Sort documents
  const sortedDocuments = useMemo(() => {
    const list = [...filteredDocuments];
    list.sort((a, b) => {
      let valA = a[sortField] || "";
      let valB = b[sortField] || "";

      if (sortField === "recordDate") {
        return sortDirection === "asc" 
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }

      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();

      if (strA < strB) return sortDirection === "asc" ? -1 : 1;
      if (strA > strB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [filteredDocuments, sortField, sortDirection]);

  // Paginated list
  const paginatedDocuments = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedDocuments.slice(start, start + pageSize);
  }, [sortedDocuments, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedDocuments.length / pageSize) || 1;

  // Keep current page inside valid bounds if documents are deleted
  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  // Handle printing active report list
  const handlePrintReport = () => {
    // We will inject a print wrapper styled element with "print-section"
    const printEl = window.document.getElementById("print-section-report");
    if (printEl) {
      window.print();
    } else {
      // Fallback: Trigger standard print
      window.print();
    }
  };

  // Convert to PDF uses native system print (Save as PDF) which is highly reliable
  const handlePrintPDF = () => {
    window.print();
  };

  // Date formatter
  const formatDate = (dateStr: string) => {
    try {
      const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric" };
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString("en-US", options);
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-5">
      {/* Search and Filters Header bar */}
      <div className="glass-panel rounded-2xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <h2 className="text-xs font-bold text-foreground flex items-center gap-2 uppercase tracking-widest">
            <SlidersHorizontal className="h-4 w-4 text-primary animate-pulse" />
            Report Search & Filter Ledger
          </h2>
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <button
              onClick={() => onExportCSV(sortedDocuments)}
              className="flex-1 md:flex-none px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm hover:shadow-md transition-all duration-150"
              id="report-export-excel-btn"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              <span>Export to Excel</span>
            </button>
            <button
              onClick={handlePrintPDF}
              className="flex-1 md:flex-none px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm hover:shadow-md transition-all duration-150"
              id="report-export-pdf-btn"
            >
              <FileDown className="h-3.5 w-3.5" />
              <span>Export to PDF</span>
            </button>
          </div>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Main text search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/80" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              placeholder="Search title, remarks..."
              className="w-full pl-9 pr-3 py-2 border rounded-lg text-xs focus:outline-none glass-input placeholder:text-muted-foreground/60"
            />
          </div>

          {/* Status select */}
          <select
            value={selectedStatus}
            onChange={e => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
            className="w-full p-2 border rounded-lg text-xs focus:outline-none glass-input"
          >
            <option value="">-- All Statuses --</option>
            <option value="Signed & Completed">Signed & Completed</option>
            <option value="Pending Review">Pending Review</option>
            <option value="Draft">Draft</option>
          </select>

          {/* Submitter select */}
          <select
            value={selectedSubmitter}
            onChange={e => { setSelectedSubmitter(e.target.value); setCurrentPage(1); }}
            className="w-full p-2 border rounded-lg text-xs focus:outline-none glass-input"
          >
            <option value="">-- All Submitters --</option>
            {uniqueSubmitters.map(sub => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>

          {/* Category filter */}
          <select
            value={selectedCategory}
            onChange={e => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
            className="w-full p-2 border rounded-lg text-xs focus:outline-none glass-input"
          >
            <option value="">-- All Categories --</option>
            {uniqueCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Date Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3.5 border-t border-border/30">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-muted-foreground/90 uppercase shrink-0">From</span>
            <input
              type="date"
              value={startDate}
              onChange={e => { setStartDate(e.target.value); setCurrentPage(1); }}
              className="w-full p-2 border rounded-lg text-xs focus:outline-none glass-input"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-muted-foreground/90 uppercase shrink-0">To</span>
            <input
              type="date"
              value={endDate}
              onChange={e => { setEndDate(e.target.value); setCurrentPage(1); }}
              className="w-full p-2 border rounded-lg text-xs focus:outline-none glass-input"
            />
          </div>

          <div className="flex justify-end items-center gap-3">
            {/* Show active count */}
            <span className="text-[10px] text-muted-foreground/80 font-mono">
              Filtered: <strong>{sortedDocuments.length}</strong> / {documents.length}
            </span>

            {(searchTerm || selectedStatus || selectedSubmitter || selectedCategory || startDate || endDate) && (
              <button
                onClick={handleClearFilters}
                className="px-2.5 py-1.5 bg-primary/10 text-primary font-bold hover:bg-primary/20 rounded-lg text-[10px] flex items-center gap-1 cursor-pointer transition-all"
              >
                <X className="h-3 w-3" />
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Ledger Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-border/40">
        <div className="overflow-x-auto w-full">
          <table className="w-full border-collapse text-left" id="print-section-report">
            <thead>
              <tr className="bg-accent/15 border-b border-border text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                <th 
                  onClick={() => handleSort("documentName")}
                  className="px-4 py-3 cursor-pointer hover:bg-accent/30 hover:text-foreground transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Document Title</span>
                    {sortField === "documentName" ? (
                      sortDirection === "asc" ? <ArrowUp className="h-3 w-3 text-primary" /> : <ArrowDown className="h-3 w-3 text-primary" />
                    ) : <ArrowUpDown className="h-3 w-3 opacity-40" />}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort("recordDate")}
                  className="px-4 py-3 cursor-pointer hover:bg-accent/30 hover:text-foreground transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Signing Date</span>
                    {sortField === "recordDate" ? (
                      sortDirection === "asc" ? <ArrowUp className="h-3 w-3 text-primary" /> : <ArrowDown className="h-3 w-3 text-primary" />
                    ) : <ArrowUpDown className="h-3 w-3 opacity-40" />}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort("createdBy")}
                  className="px-4 py-3 cursor-pointer hover:bg-accent/30 hover:text-foreground transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Submitted By</span>
                    {sortField === "createdBy" ? (
                      sortDirection === "asc" ? <ArrowUp className="h-3 w-3 text-primary" /> : <ArrowDown className="h-3 w-3 text-primary" />
                    ) : <ArrowUpDown className="h-3 w-3 opacity-40" />}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort("category")}
                  className="px-4 py-3 cursor-pointer hover:bg-accent/30 hover:text-foreground transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Category</span>
                    {sortField === "category" ? (
                      sortDirection === "asc" ? <ArrowUp className="h-3 w-3 text-primary" /> : <ArrowDown className="h-3 w-3 text-primary" />
                    ) : <ArrowUpDown className="h-3 w-3 opacity-40" />}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort("department")}
                  className="px-4 py-3 cursor-pointer hover:bg-accent/30 hover:text-foreground transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Department</span>
                    {sortField === "department" ? (
                      sortDirection === "asc" ? <ArrowUp className="h-3 w-3 text-primary" /> : <ArrowDown className="h-3 w-3 text-primary" />
                    ) : <ArrowUpDown className="h-3 w-3 opacity-40" />}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort("status")}
                  className="px-4 py-3 cursor-pointer hover:bg-accent/30 hover:text-foreground transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Status</span>
                    {sortField === "status" ? (
                      sortDirection === "asc" ? <ArrowUp className="h-3 w-3 text-primary" /> : <ArrowDown className="h-3 w-3 text-primary" />
                    ) : <ArrowUpDown className="h-3 w-3 opacity-40" />}
                  </div>
                </th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-xs text-foreground">
              {paginatedDocuments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-muted-foreground bg-accent/5">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <FileText className="h-8 w-8 text-muted-foreground/40 animate-pulse" />
                      <p className="font-semibold">No report records matched your filters.</p>
                      <button 
                        onClick={handleClearFilters}
                        className="text-primary font-bold hover:underline text-[11px]"
                      >
                        Reset all filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedDocuments.map(doc => (
                  <tr 
                    key={doc.id}
                    className="hover:bg-accent/5 transition-colors group"
                  >
                    {/* Document Title */}
                    <td className="px-4 py-3">
                      <div>
                        <span className="font-bold text-foreground block truncate max-w-[200px]" title={doc.documentName}>
                          {doc.documentName}
                        </span>
                        {doc.remarks && (
                          <span className="block text-[10px] text-muted-foreground truncate max-w-[200px] mt-0.5 font-normal">
                            {doc.remarks}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Signing Date */}
                    <td className="px-4 py-3 whitespace-nowrap font-medium text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-primary shrink-0 opacity-60" />
                        <span>{formatDate(doc.recordDate)}</span>
                      </div>
                    </td>

                    {/* Submitted By */}
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <UserCheck className="h-3.5 w-3.5 text-primary shrink-0 opacity-60" />
                        <span className="truncate max-w-[120px] font-mono text-[11px]">{doc.createdBy || "System"}</span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <FolderDot className="h-3.5 w-3.5 text-primary shrink-0 opacity-60" />
                        <span className="font-semibold text-foreground">{doc.category}</span>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-primary shrink-0 opacity-60" />
                        <span className="font-semibold text-foreground">{doc.department}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        doc.status === "Signed & Completed"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400"
                          : doc.status === "Pending Review"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400"
                          : "bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400"
                      }`}>
                        {doc.status}
                      </span>
                    </td>

                    {/* Actions cell */}
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onView(doc)}
                          className="p-1 hover:bg-accent text-muted-foreground hover:text-foreground rounded transition-colors"
                          title="View Ledger"
                          id={`report-view-${doc.id}`}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => onEdit(doc)}
                          className="p-1 hover:bg-accent text-muted-foreground hover:text-foreground rounded transition-colors"
                          title="Edit Document"
                          id={`report-edit-${doc.id}`}
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => onDelete(doc.id)}
                          className="p-1 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded transition-colors"
                          title="Delete Document"
                          id={`report-delete-${doc.id}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer controls: page size, totals, and numbers */}
        <div className="bg-accent/10 border-t border-border px-4 py-3 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {/* Page Size selector */}
            <div className="flex items-center gap-1.5">
              <span>Show</span>
              <select
                value={pageSize}
                onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                className="p-1 border rounded bg-background text-foreground text-xs focus:ring-1 focus:ring-primary focus:outline-none"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span>records</span>
            </div>

            {/* Counts */}
            <span>
              Showing <strong className="text-foreground">{sortedDocuments.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</strong> to{" "}
              <strong className="text-foreground">{Math.min(currentPage * pageSize, sortedDocuments.length)}</strong> of{" "}
              <strong className="text-foreground">{sortedDocuments.length}</strong> matching
            </span>
          </div>

          {/* Page triggers */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1 border rounded bg-background hover:bg-accent text-foreground disabled:opacity-40"
              title="Previous Page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {Array.from({ length: totalPages }, (_, index) => {
              const pNum = index + 1;
              return (
                <button
                  key={pNum}
                  onClick={() => setCurrentPage(pNum)}
                  className={`px-2.5 py-1 text-xs font-bold rounded transition-colors ${
                    currentPage === pNum
                      ? "bg-primary text-white"
                      : "border bg-background hover:bg-accent text-foreground"
                  }`}
                >
                  {pNum}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1 border rounded bg-background hover:bg-accent text-foreground disabled:opacity-40"
              title="Next Page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
