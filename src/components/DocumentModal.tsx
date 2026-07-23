import React, { useState, useEffect, useRef } from "react";
import { DocumentRecord } from "../types";
import {
  X,
  Mic,
  MicOff,
  Sparkles,
  Save,
  Clock,
  Database,
  Building2,
  FolderOpen,
  ChevronRight,
  RefreshCw,
  Info,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (docData: Partial<DocumentRecord>) => Promise<void>;
  editingDocument: DocumentRecord | null;
}

export const DocumentModal: React.FC<DocumentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingDocument,
}) => {
  const isEditMode = !!editingDocument;

  // Active Tab: "voice" or "manual"
  const [activeTab, setActiveTab] = useState<"voice" | "manual">("voice");

  // Form states
  const [documentName, setDocumentName] = useState("");
  const [category, setCategory] = useState("Immigration / Visa");
  const [department, setDepartment] = useState("HR");
  const [recordDate, setRecordDate] = useState("");
  const [status, setStatus] = useState<"Signed & Completed" | "Pending Review" | "Draft">("Signed & Completed");
  const [storageLocation, setStorageLocation] = useState("Google Drive");
  const [remarks, setRemarks] = useState("");

  // Voice Input States
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiParsedPreview, setAiParsedPreview] = useState<any | null>(null);

  // Speech Recognition API reference
  const recognitionRef = useRef<any>(null);

  // Categories list
  const categoriesList = [
    "Immigration / Visa",
    "Legal",
    "Finance",
    "Contract",
    "Real Estate",
    "HR",
    "Corporate",
    "Personal",
    "General",
  ];

  // Departments list
  const departmentsList = [
    "HR",
    "Legal",
    "Finance",
    "Operations",
    "Government",
    "General",
  ];

  // Storage locations presets
  const storagePresets = [
    "Google Drive - Secure HR",
    "Google Drive - Finance Secure",
    "OneDrive - Contracts",
    "OneDrive - Personal Vault",
    "Physical File Cab - Drawer A",
    "Physical File Cab - Drawer B",
    "Local Storage - Encrypted DB",
  ];

  // Voice Simulation Templates
  const simulationTemplates = [
    {
      label: "Visa Extension",
      text: "the Visa Extension document for employee renewal on July 21, 2026.",
    },
    {
      label: "Office Lease Agreement",
      text: "Signed the Office Lease Agreement for the Sector 4 operation floor on June 15, 2026. File cabinet Drawer B.",
    },
    {
      label: "Consulting Agreement",
      text: "I signed the Software Consulting Service Agreement with legal department, files are placed in OneDrive on May 10, 2026.",
    },
    {
      label: "Financial Statements",
      text: "Approved and completed the Q2 Financial Statement on July 10, 2026, stored in Google Drive finance folder.",
    },
  ];

  // Initialize form with editing document data if editing
  useEffect(() => {
    if (editingDocument) {
      setDocumentName(editingDocument.documentName);
      setCategory(editingDocument.category);
      setDepartment(editingDocument.department);
      setRecordDate(editingDocument.recordDate);
      setStatus(editingDocument.status);
      setStorageLocation(editingDocument.storageLocation);
      setRemarks(editingDocument.remarks);
      setActiveTab("manual"); // default to manual editing
      setAiParsedPreview(null);
    } else {
      // reset form for new creation
      setDocumentName("");
      setCategory("Immigration / Visa");
      setDepartment("HR");
      setRecordDate(new Date().toISOString().split("T")[0]);
      setStatus("Signed & Completed");
      setStorageLocation("Google Drive");
      setRemarks("");
      setActiveTab("voice");
      setVoiceTranscript("");
      setAiParsedPreview(null);
      setAiError("");
    }
  }, [editingDocument, isOpen]);

  // Handle Speech Recognition setup
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
        setAiError("");
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech Recognition Error:", event.error);
        setIsListening(false);
        if (event.error === "not-allowed") {
          setAiError("Microphone permission denied. Try the Simulation template dropdown below!");
        } else {
          setAiError(`Microphone connection issue: ${event.error}`);
        }
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const currentText = finalTranscript || interimTranscript;
        if (currentText) {
          setVoiceTranscript(currentText);
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setAiError(
        "Voice input is not fully supported in this browser. Please use the quick simulation templates or type the spoken words manually below!"
      );
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setVoiceTranscript("");
      setAiParsedPreview(null);
      setAiError("");
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error("Recognition start error:", err);
      }
    }
  };

  const selectSimulationTemplate = (text: string) => {
    setVoiceTranscript(text);
    setAiError("");
    setAiParsedPreview(null);
  };

  // Process text transcript via Server-side Gemini API
  const handleProcessVoice = async () => {
    if (!voiceTranscript.trim()) {
      setAiError("Please speak or insert a voice transcript first.");
      return;
    }

    setIsAiProcessing(true);
    setAiError("");
    setAiParsedPreview(null);

    try {
      const response = await fetch("/api/parse-voice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transcript: voiceTranscript,
          localDate: new Date().toISOString().split("T")[0],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to communicate with AI parsing engine");
      }

      const data = await response.json();
      setAiParsedPreview(data);

      // Instantly map fields for the manual tab as a draft
      setDocumentName(data.documentName || "");
      setCategory(data.category || "General");
      setDepartment(data.department || "General");
      setRecordDate(data.recordDate || new Date().toISOString().split("T")[0]);
      setStatus(data.status || "Signed & Completed");
      setRemarks(data.remarks || "");
    } catch (err: any) {
      console.error(err);
      setAiError("AI parsing server was unresponsive. Please fill manually or retry.");
    } finally {
      setIsAiProcessing(false);
    }
  };

  // Submit final record to database
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentName.trim()) {
      alert("Document Name is required.");
      return;
    }

    const payload: Partial<DocumentRecord> = {
      documentName,
      category,
      department,
      recordDate: recordDate || new Date().toISOString().split("T")[0],
      status,
      storageLocation,
      remarks,
    };

    if (isEditMode && editingDocument) {
      payload.id = editingDocument.id;
    }

    await onSave(payload);
    onClose();
  };

  const applyParsedPreviewAndSave = async () => {
    if (!aiParsedPreview) return;

    const payload: Partial<DocumentRecord> = {
      documentName: aiParsedPreview.documentName || "Voice Note",
      category: aiParsedPreview.category || "General",
      department: aiParsedPreview.department || "General",
      recordDate: aiParsedPreview.recordDate || new Date().toISOString().split("T")[0],
      status: aiParsedPreview.status || "Signed & Completed",
      storageLocation: storageLocation || "Google Drive",
      remarks: aiParsedPreview.remarks || "",
    };

    await onSave(payload);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-2xl bg-card text-card-foreground border rounded-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-border bg-accent/10">
          <div>
            <h3 className="text-sm font-bold font-sans tracking-tight text-foreground flex items-center gap-1.5">
              {isEditMode ? (
                <>Update Document Record</>
              ) : (
                <>
                  Create Signature Record
                  <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold">
                    Voice Auto-Write
                  </span>
                </>
              )}
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {isEditMode
                ? "Modifications will automatically append to the document audit trail."
                : "Record details of signed files manually or instantly using AI voice."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Create Mode Tab Switcher */}
        {!isEditMode && (
          <div className="flex border-b border-border bg-accent/20 px-4 pt-1.5">
            <button
              onClick={() => setActiveTab("voice")}
              className={`pb-2 text-xs font-semibold px-3.5 flex items-center gap-1.5 border-b-2 transition-all ${
                activeTab === "voice"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Mic className="h-3 w-3" />
              Voice Record Entry
            </button>
            <button
              onClick={() => setActiveTab("manual")}
              className={`pb-2 text-xs font-semibold px-3.5 flex items-center gap-1.5 border-b-2 transition-all ${
                activeTab === "manual"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Database className="h-3 w-3" />
              Manual Input Form
            </button>
          </div>
        )}

        {/* Modal Scrollable Content */}
        <div className="p-4 overflow-y-auto flex-1">
          <AnimatePresence mode="wait">
            {activeTab === "voice" && !isEditMode ? (
              <motion.div
                key="voice-tab"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.15 }}
                className="space-y-6"
              >
                {/* Visual Microphone Ring Stage */}
                <div className="flex flex-col items-center justify-center p-8 bg-accent/10 border border-dashed rounded-2xl relative overflow-hidden">
                  {/* Pulse animations when listening */}
                  {isListening && (
                    <span className="absolute animate-ping inline-flex h-36 w-36 rounded-full bg-primary/10 opacity-75"></span>
                  )}

                  <button
                    type="button"
                    onClick={toggleListening}
                    className={`relative z-10 p-6 rounded-full border-2 transition-all duration-300 shadow-lg ${
                      isListening
                        ? "bg-red-500 border-red-400 text-white animate-pulse"
                        : "bg-primary border-primary/20 text-white hover:scale-105"
                    }`}
                    id="mic-record-btn"
                  >
                    {isListening ? (
                      <MicOff className="h-8 w-8" />
                    ) : (
                      <Mic className="h-8 w-8" />
                    )}
                  </button>

                  <h4 className="text-sm font-semibold text-foreground mt-4">
                    {isListening ? "Listening... Speak naturally" : "Click to Speak"}
                  </h4>
                  <p className="text-xs text-muted-foreground text-center mt-1 max-w-[320px]">
                    Describe your document, signing date, category, and storage details.
                  </p>

                  {/* Tiny simulated sound wave animation */}
                  {isListening && (
                    <div className="flex gap-1.5 mt-3 justify-center items-center">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className="w-1 bg-red-400 rounded-full animate-bounce"
                          style={{
                            height: `${Math.random() * 20 + 8}px`,
                            animationDelay: `${i * 0.15}s`,
                          }}
                        ></div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Simulated Templates for Sandbox safety */}
                <div className="p-4 rounded-xl border border-border/80 bg-card">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-primary mb-2">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>💡 Sandbox Guide: Simulate Spoken Transcript</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mb-3 leading-relaxed">
                    If microphone permissions are restricted in your browser/iframe, click any quick executive template below to populate the transcription box instantly:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {simulationTemplates.map((template, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => selectSimulationTemplate(template.text)}
                        className="text-[11px] px-2.5 py-1 rounded-lg border bg-accent/30 hover:bg-primary/10 hover:text-primary hover:border-primary/20 text-muted-foreground transition-all duration-150"
                        id={`simulate-btn-${index}`}
                      >
                        {template.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Transcription Text Box */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Spoken Transcript
                  </label>
                  <textarea
                    value={voiceTranscript}
                    onChange={(e) => setVoiceTranscript(e.target.value)}
                    placeholder='e.g., "Signed the Visa Extension document for employee renewal on July 21, 2026. File stored in Google Drive"'
                    className="w-full h-24 p-3 text-xs border rounded-xl bg-background text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                    id="voice-transcript-input"
                  />
                </div>

                {/* Action Row for AI Parsing */}
                <div className="flex justify-between items-center pt-2">
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Info className="h-3.5 w-3.5 text-primary" />
                    <span>Parses via Gemini 3.5-flash server SDK</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleProcessVoice}
                    disabled={isAiProcessing || !voiceTranscript.trim()}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-white hover:opacity-90 disabled:opacity-50 flex items-center gap-2 shadow-sm cursor-pointer"
                    id="parse-voice-btn"
                  >
                    {isAiProcessing ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        AI Parsing Draft...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5" />
                        Process Statement with AI
                      </>
                    )}
                  </button>
                </div>

                {/* Error Box */}
                {aiError && (
                  <div className="p-3 bg-destructive/5 text-destructive border border-destructive/10 rounded-xl text-xs leading-relaxed">
                    {aiError}
                  </div>
                )}

                {/* AI Extracted Structured Preview Panel */}
                <AnimatePresence>
                  {aiParsedPreview && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="p-5 border border-primary/20 bg-primary/5 rounded-2xl space-y-4"
                      id="ai-preview-panel"
                    >
                      <div className="flex justify-between items-center border-b border-primary/10 pb-2.5">
                        <span className="text-xs font-bold text-primary flex items-center gap-1.5 uppercase tracking-wider">
                          <CheckCircle2 className="h-4 w-4" />
                          Structured Fields Extracted
                        </span>
                        <span className="text-[10px] font-semibold text-muted-foreground bg-accent px-2 py-0.5 rounded">
                          Validated Draft
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                        <div>
                          <span className="text-muted-foreground block text-[10px] uppercase font-bold">
                            Inferred Title
                          </span>
                          <span className="font-semibold text-foreground">
                            {aiParsedPreview.documentName}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[10px] uppercase font-bold">
                            Extracted Category
                          </span>
                          <span className="font-semibold text-foreground">
                            {aiParsedPreview.category}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[10px] uppercase font-bold">
                            Date of Signature
                          </span>
                          <span className="font-semibold text-foreground">
                            {aiParsedPreview.recordDate}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[10px] uppercase font-bold">
                            Assigned Department
                          </span>
                          <span className="font-semibold text-foreground">
                            {aiParsedPreview.department}
                          </span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-muted-foreground block text-[10px] uppercase font-bold">
                            Remarks/Summary
                          </span>
                          <p className="text-muted-foreground mt-0.5 text-[11px] leading-relaxed">
                            {aiParsedPreview.remarks}
                          </p>
                        </div>
                      </div>

                      {/* Storage input picker for voice */}
                      <div className="pt-2 border-t border-primary/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex-1">
                          <label className="text-[10px] font-bold uppercase text-muted-foreground block mb-1">
                            Set Storage Location
                          </label>
                          <select
                            value={storageLocation}
                            onChange={(e) => setStorageLocation(e.target.value)}
                            className="w-full p-2 border rounded-lg bg-background text-foreground text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                          >
                            {storagePresets.map((preset) => (
                              <option key={preset} value={preset}>
                                {preset}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex gap-2 shrink-0 sm:pt-4">
                          <button
                            type="button"
                            onClick={() => setActiveTab("manual")}
                            className="px-3 py-2 border rounded-xl text-xs hover:bg-accent text-foreground cursor-pointer"
                          >
                            Edit Further
                          </button>
                          <button
                            type="button"
                            onClick={applyParsedPreviewAndSave}
                            className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-semibold hover:opacity-90 flex items-center gap-1.5 cursor-pointer shadow-sm"
                            id="voice-approve-save-btn"
                          >
                            <Save className="h-3.5 w-3.5" />
                            Approve & Save
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.form
                key="manual-tab"
                onSubmit={handleSubmit}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                {/* Document Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                    Document Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={documentName}
                    onChange={(e) => setDocumentName(e.target.value)}
                    placeholder="e.g. Visa Extension Approval"
                    className="w-full p-2.5 border rounded-xl bg-background text-foreground text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                    id="manual-doc-name-input"
                  />
                </div>

                {/* Grid for Dates, Categories, Dept */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Category select */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full p-2.5 border rounded-xl bg-background text-foreground text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                    >
                      {categoriesList.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Department select */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                      Department
                    </label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full p-2.5 border rounded-xl bg-background text-foreground text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                    >
                      {departmentsList.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Signed Date */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                      Signature Date
                    </label>
                    <input
                      type="date"
                      value={recordDate}
                      onChange={(e) => setRecordDate(e.target.value)}
                      className="w-full p-2.5 border rounded-xl bg-background text-foreground text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                    />
                  </div>

                  {/* Document status */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                      Signature Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full p-2.5 border rounded-xl bg-background text-foreground text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                    >
                      <option value="Signed & Completed">Signed & Completed</option>
                      <option value="Pending Review">Pending Review</option>
                      <option value="Draft">Draft</option>
                    </select>
                  </div>
                </div>

                {/* Storage preset or manual location */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                    File Storage Location
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        value={storageLocation}
                        onChange={(e) => setStorageLocation(e.target.value)}
                        placeholder="e.g. Google Drive - Secure Vault"
                        className="w-full p-2.5 border rounded-xl bg-background text-foreground text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                      />
                    </div>
                    <select
                      onChange={(e) => {
                        if (e.target.value) setStorageLocation(e.target.value);
                      }}
                      className="p-2.5 border rounded-xl bg-background text-foreground text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                    >
                      <option value="">-- Presets --</option>
                      {storagePresets.map((preset) => (
                        <option key={preset} value={preset}>
                          {preset}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Remarks / Text Details */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                    Remarks & Additional Context
                  </label>
                  <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Enter additional summaries, employee names, renewal specifics..."
                    className="w-full h-24 p-2.5 border rounded-xl bg-background text-foreground text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>

                {/* Manual Actions Row */}
                <div className="flex justify-end gap-2.5 pt-4 border-t border-border mt-6">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 border rounded-xl text-xs hover:bg-accent text-foreground cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-primary text-white font-semibold rounded-xl text-xs hover:opacity-90 flex items-center gap-1.5 shadow-sm cursor-pointer"
                    id="manual-save-btn"
                  >
                    <Save className="h-4 w-4" />
                    {isEditMode ? "Update Record" : "Save Document Record"}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
