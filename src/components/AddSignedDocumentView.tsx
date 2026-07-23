import React, { useState, useEffect, useRef } from "react";
import { DocumentRecord } from "../types";
import {
  Mic,
  MicOff,
  Sparkles,
  Save,
  Database,
  Building2,
  FolderOpen,
  ChevronRight,
  RefreshCw,
  Info,
  CheckCircle2,
  User,
  Calendar,
  Layers,
  MapPin,
  ClipboardList
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AddSignedDocumentViewProps {
  onSave: (docData: Partial<DocumentRecord>) => Promise<void>;
  language: "en" | "km";
  userEmail: string;
}

export const AddSignedDocumentView: React.FC<AddSignedDocumentViewProps> = ({
  onSave,
  language,
  userEmail,
}) => {
  // Active Input Mode: "voice" or "manual"
  const [activeTab, setActiveTab] = useState<"voice" | "manual">("voice");

  // Form states
  const [documentName, setDocumentName] = useState("");
  const [category, setCategory] = useState("Immigration / Visa");
  const [department, setDepartment] = useState("HR");
  const [recordDate, setRecordDate] = useState(new Date().toISOString().split("T")[0]);
  const [status, setStatus] = useState<"Signed & Completed" | "Pending Review" | "Draft">("Signed & Completed");
  const [storageLocation, setStorageLocation] = useState("Google Drive - Secure HR");
  const [remarks, setRemarks] = useState("");
  const [submittedBy, setSubmittedBy] = useState(userEmail || "westernassenmenttest@gmail.com");

  // Voice Input States
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiParsedPreview, setAiParsedPreview] = useState<any | null>(null);

  // Speech Recognition API reference
  const recognitionRef = useRef<any>(null);

  // Lists
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

  const departmentsList = [
    "HR",
    "Legal",
    "Finance",
    "Operations",
    "Government",
    "General",
  ];

  const storagePresets = [
    "Google Drive - Secure HR",
    "Google Drive - Finance Secure",
    "OneDrive - Contracts",
    "OneDrive - Personal Vault",
    "Physical File Cab - Drawer A",
    "Physical File Cab - Drawer B",
    "Local Storage - Encrypted DB",
  ];

  const simulationTemplates = [
    {
      label: "Visa Extension",
      text: "The Visa Extension document for employee renewal signed today on July 22, 2026. Put it in HR department.",
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

  // Speech Recognition hook
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
          setAiError("Microphone permission denied. Try the Sandbox simulation presets below!");
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
        "Voice input is not fully supported in this browser environment. Use the Simulation Presets to try voice auto-write!"
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

  const handleProcessVoice = async () => {
    if (!voiceTranscript.trim()) {
      setAiError("Please type or record a spoken transcript first.");
      return;
    }

    setIsAiProcessing(true);
    setAiError("");
    setAiParsedPreview(null);

    try {
      let data;
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

        data = await response.json();
      } catch (apiErr) {
        console.warn("Express server unavailable, falling back to smart client-side voice parsing:", apiErr);
        // Robust regex-based fallback parsing
        const text = voiceTranscript.toLowerCase();
        const today = new Date().toISOString().split("T")[0];
        
        let documentName = "Voice Note Record";
        let category = "General";
        let department = "General";
        let status = "Signed & Completed";
        let recordDate = today;
        let remarks = voiceTranscript;

        if (text.includes("visa") || text.includes("extension") || text.includes("passport") || text.includes("immigration")) {
          category = "Immigration / Visa";
          department = "HR";
          documentName = "Visa Extension Document";
        } else if (text.includes("lease") || text.includes("rent") || text.includes("apartment") || text.includes("office")) {
          category = "Real Estate";
          department = "Operations";
          documentName = "Lease Agreement";
        } else if (text.includes("contract") || text.includes("nda") || text.includes("agreement") || text.includes("consulting")) {
          category = "Contract";
          department = "Legal";
          documentName = "Consulting & Service Agreement";
        } else if (text.includes("financial") || text.includes("tax") || text.includes("billing") || text.includes("audit") || text.includes("salary")) {
          category = "Finance";
          department = "Finance";
          documentName = "Financial Document";
        } else if (text.includes("onboarding") || text.includes("employee") || text.includes("hire") || text.includes("recruit")) {
          category = "HR";
          department = "HR";
          documentName = "Employee Record Document";
        }

        // Attempt to extract title
        const cleanText = voiceTranscript.trim();
        if (cleanText.length > 5 && cleanText.length < 60) {
          documentName = cleanText;
        } else {
          const words = cleanText.split(" ");
          if (words.length > 1) {
            documentName = words.slice(0, 4).join(" ").replace(/^[tT]he\s+/, "");
            documentName = documentName.replace(/\b\w/g, l => l.toUpperCase());
          }
        }

        // Attempt to scan dates
        const dateMatch = voiceTranscript.match(/(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}(st|nd|rd|th)?,\s+\d{4}/i);
        if (dateMatch) {
          try {
            const parsedDate = new Date(dateMatch[0]);
            if (!isNaN(parsedDate.getTime())) {
              recordDate = parsedDate.toISOString().split("T")[0];
            }
          } catch (_) {}
        }

        data = {
          documentName,
          category,
          recordDate,
          department,
          status,
          remarks: `${remarks} (Offline Mode Fallback)`
        };
      }

      setAiParsedPreview(data);

      // Auto-populate form
      setDocumentName(data.documentName || "");
      setCategory(data.category || "General");
      setDepartment(data.department || "General");
      setRecordDate(data.recordDate || new Date().toISOString().split("T")[0]);
      setStatus(data.status || "Signed & Completed");
      setRemarks(data.remarks || "");
    } catch (err: any) {
      console.error(err);
      setAiError("AI parsing server was unresponsive. Please fill out manually or retry.");
    } finally {
      setIsAiProcessing(false);
    }
  };

  const resetForm = () => {
    setDocumentName("");
    setCategory("Immigration / Visa");
    setDepartment("HR");
    setRecordDate(new Date().toISOString().split("T")[0]);
    setStatus("Signed & Completed");
    setStorageLocation("Google Drive - Secure HR");
    setRemarks("");
    setSubmittedBy(userEmail || "westernassenmenttest@gmail.com");
    setVoiceTranscript("");
    setAiParsedPreview(null);
  };

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
      createdBy: submittedBy,
    };

    try {
      await onSave(payload);
      resetForm();
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveVoice = async () => {
    if (!aiParsedPreview) return;
    const payload: Partial<DocumentRecord> = {
      documentName: aiParsedPreview.documentName || "Voice Record",
      category: aiParsedPreview.category || "General",
      department: aiParsedPreview.department || "General",
      recordDate: aiParsedPreview.recordDate || new Date().toISOString().split("T")[0],
      status: aiParsedPreview.status || "Signed & Completed",
      storageLocation: storageLocation,
      remarks: aiParsedPreview.remarks || "",
      createdBy: submittedBy,
    };

    try {
      await onSave(payload);
      resetForm();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl flex items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
            <ClipboardList className="h-4.5 w-4.5 text-primary" />
            Add New Signed Document Record
          </h2>
          <p className="text-[11px] text-muted-foreground mt-1 max-w-xl leading-relaxed">
            Create an immutable record of signed contracts, receipts, visa papers, or lease agreements. Fill details manually or use our smart Gemini-powered voice parser.
          </p>
        </div>
        <span className="hidden sm:inline-flex px-2 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-[9px] font-bold rounded-md">
          AUTO-AUDIT ENABLED
        </span>
      </div>

      {/* Mode Tabs */}
      <div className="flex border-b border-border bg-card/40 rounded-t-xl p-1 pb-0 gap-1">
        <button
          onClick={() => setActiveTab("voice")}
          className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-all flex items-center gap-1.5 border-b-2 ${
            activeTab === "voice"
              ? "bg-background border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Mic className="h-3.5 w-3.5" />
          AI Voice Assistant Entry
        </button>
        <button
          onClick={() => setActiveTab("manual")}
          className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-all flex items-center gap-1.5 border-b-2 ${
            activeTab === "manual"
              ? "bg-background border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Database className="h-3.5 w-3.5" />
          Standard Manual Input Form
        </button>
      </div>

      {/* Main Container Area */}
      <div className="bg-card border border-border rounded-b-xl p-5 shadow-xs">
        <AnimatePresence mode="wait">
          {activeTab === "voice" ? (
            <motion.div
              key="voice-mode"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* Left Column: Recording Desk */}
              <div className="lg:col-span-5 space-y-5">
                <div className="flex flex-col items-center justify-center p-6 bg-accent/25 border border-dashed border-border rounded-xl relative overflow-hidden">
                  {isListening && (
                    <span className="absolute animate-ping inline-flex h-28 w-28 rounded-full bg-primary/10 opacity-75"></span>
                  )}

                  <button
                    type="button"
                    onClick={toggleListening}
                    className={`p-5 rounded-full border transition-all duration-300 shadow-md ${
                      isListening
                        ? "bg-red-500 border-red-400 text-white animate-pulse"
                        : "bg-primary border-primary/20 text-white hover:scale-105"
                    }`}
                  >
                    {isListening ? (
                      <MicOff className="h-7 w-7" />
                    ) : (
                      <Mic className="h-7 w-7" />
                    )}
                  </button>

                  <h3 className="text-xs font-bold text-foreground mt-3 uppercase tracking-wider">
                    {isListening ? "System is Listening..." : "Click to Speak"}
                  </h3>
                  <p className="text-[10px] text-muted-foreground text-center mt-1 max-w-[240px]">
                    "Signed the visa extension document renewal for Operation team today"
                  </p>

                  {isListening && (
                    <div className="flex gap-1 mt-2.5 items-center justify-center">
                      {[1, 2, 3, 4, 5].map((idx) => (
                        <div
                          key={idx}
                          className="w-1 bg-red-400 rounded-full animate-bounce"
                          style={{
                            height: `${Math.random() * 16 + 6}px`,
                            animationDelay: `${idx * 0.12}s`,
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Templates presets */}
                <div className="p-3.5 border border-border bg-card rounded-lg">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-primary uppercase tracking-wide mb-2">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Quick Sandbox Transcriptions</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {simulationTemplates.map((template, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => selectSimulationTemplate(template.text)}
                        className="text-[10px] p-2 border border-border bg-accent/20 hover:bg-primary/5 hover:text-primary rounded text-left transition-all truncate"
                        title={template.text}
                      >
                        {template.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Parsed output */}
              <div className="lg:col-span-7 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Transcript Input Text
                  </label>
                  <textarea
                    value={voiceTranscript}
                    onChange={(e) => setVoiceTranscript(e.target.value)}
                    placeholder='Type details here or click microphone above to speak. E.g., "Software renewal document signed by legal department on May 10th..."'
                    className="w-full h-28 p-3 text-xs border rounded-xl bg-background text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div className="flex justify-between items-center gap-3">
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Info className="h-3.5 w-3.5 text-primary shrink-0" />
                    Parses dynamically via Gemini LLM
                  </span>

                  <button
                    onClick={handleProcessVoice}
                    disabled={isAiProcessing || !voiceTranscript.trim()}
                    className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg shadow hover:opacity-90 disabled:opacity-40 flex items-center gap-1.5 cursor-pointer"
                  >
                    {isAiProcessing ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        AI Parsing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5" />
                        Extract with AI
                      </>
                    )}
                  </button>
                </div>

                {aiError && (
                  <div className="p-3 border border-destructive/20 bg-destructive/5 text-destructive text-xs rounded-lg">
                    {aiError}
                  </div>
                )}

                {/* Extracted fields */}
                <AnimatePresence>
                  {aiParsedPreview && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="p-4 border border-primary/20 bg-primary/5 rounded-xl space-y-4"
                    >
                      <div className="flex justify-between items-center border-b border-primary/10 pb-2">
                        <span className="text-[10px] font-bold text-primary flex items-center gap-1 uppercase tracking-wider">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Parsed Structured Blueprint
                        </span>
                        <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold font-mono">
                          DRAFT OK
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-muted-foreground text-[9px] block uppercase font-bold">Document Title</span>
                          <span className="font-semibold text-foreground">{aiParsedPreview.documentName}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-[9px] block uppercase font-bold">Category Class</span>
                          <span className="font-semibold text-foreground">{aiParsedPreview.category}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-[9px] block uppercase font-bold">Signature Date</span>
                          <span className="font-semibold text-foreground">{aiParsedPreview.recordDate}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-[9px] block uppercase font-bold">Department</span>
                          <span className="font-semibold text-foreground">{aiParsedPreview.department}</span>
                        </div>
                        <div className="col-span-1 sm:col-span-2">
                          <span className="text-muted-foreground text-[9px] block uppercase font-bold">Summary Remarks</span>
                          <p className="text-muted-foreground leading-relaxed mt-0.5">{aiParsedPreview.remarks}</p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-primary/10 flex flex-col sm:flex-row gap-3 items-end sm:items-center justify-between">
                        <div className="w-full sm:w-auto flex-1">
                          <span className="text-[9px] text-muted-foreground block font-bold uppercase mb-1">Set Storage Node</span>
                          <select
                            value={storageLocation}
                            onChange={(e) => setStorageLocation(e.target.value)}
                            className="w-full p-2 border rounded-lg bg-background text-xs"
                          >
                            {storagePresets.map((preset) => (
                              <option key={preset} value={preset}>
                                {preset}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="flex gap-2 w-full sm:w-auto">
                          <button
                            onClick={() => setActiveTab("manual")}
                            className="flex-1 sm:flex-none px-3.5 py-2 border rounded-lg text-xs hover:bg-accent text-foreground"
                          >
                            Refine Manually
                          </button>
                          <button
                            onClick={handleApproveVoice}
                            className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1"
                          >
                            <Save className="h-3.5 w-3.5" />
                            Approve & Save
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ) : (
            <motion.form
              key="manual-mode"
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="space-y-4"
            >
              {/* Document Title & Submitted By */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Document Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={documentName}
                    onChange={(e) => setDocumentName(e.target.value)}
                    placeholder="e.g. Visa Extension Approval"
                    className="w-full p-2.5 border rounded-xl bg-background text-foreground text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Submitted By (Author)
                  </label>
                  <input
                    type="email"
                    required
                    value={submittedBy}
                    onChange={(e) => setSubmittedBy(e.target.value)}
                    className="w-full p-2.5 border rounded-xl bg-background text-foreground text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Grid 2: Date, Category, Department, Status */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                {/* Signature Date */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Signature Date
                  </label>
                  <input
                    type="date"
                    required
                    value={recordDate}
                    onChange={(e) => setRecordDate(e.target.value)}
                    className="w-full p-2.5 border rounded-xl bg-background text-foreground text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>

                {/* Category select */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Category Class
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
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
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

                {/* Status select */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Status Registry
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

              {/* Grid 3: Storage Location preset or manual */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  File Storage Location Location Node
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <input
                    type="text"
                    required
                    value={storageLocation}
                    onChange={(e) => setStorageLocation(e.target.value)}
                    placeholder="e.g. Google Drive - Secure HR"
                    className="sm:col-span-2 w-full p-2.5 border rounded-xl bg-background text-foreground text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                  <select
                    onChange={(e) => {
                      if (e.target.value) setStorageLocation(e.target.value);
                    }}
                    className="w-full p-2.5 border rounded-xl bg-background text-foreground text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                  >
                    <option value="">-- Storage Presets --</option>
                    {storagePresets.map((preset) => (
                      <option key={preset} value={preset}>
                        {preset}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Remarks/Internal Notes */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Internal Remarks & Log Summaries
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Record summary details, specific conditions, renewal dates, scan IDs..."
                  className="w-full h-24 p-3 border rounded-xl bg-background text-foreground text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>

              {/* Controls */}
              <div className="flex justify-end gap-2.5 pt-4 border-t border-border mt-5">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border rounded-lg text-xs hover:bg-accent text-foreground cursor-pointer"
                >
                  Clear Fields
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary hover:opacity-90 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow"
                >
                  <Save className="h-4 w-4" />
                  Save Document Record
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
