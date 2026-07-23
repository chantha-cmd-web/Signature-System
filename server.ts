import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize path resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure data folder and documents.json file exist
const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "documents.json");

const initialDocuments = [
  {
    id: "doc-1",
    documentName: "Visa Extension - Employee Renewal",
    recordDate: "2026-07-21",
    category: "Immigration / Visa",
    department: "Academics",
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
    department: "Operations",
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
    department: "Academics",
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

function readDocuments(): any[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(initialDocuments, null, 2));
      return initialDocuments;
    }
    const data = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading documents file:", error);
    return initialDocuments;
  }
}

function writeDocuments(docs: any[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(docs, null, 2));
  } catch (error) {
    console.error("Error writing documents file:", error);
  }
}

// REST APIs
app.get("/api/documents", (req, res) => {
  const docs = readDocuments();
  res.json(docs);
});

app.post("/api/documents", (req, res) => {
  const docs = readDocuments();
  const newDoc = {
    id: `doc-${Date.now()}`,
    documentName: req.body.documentName || "Untitled Document",
    recordDate: req.body.recordDate || new Date().toISOString().split("T")[0],
    category: req.body.category || "General",
    department: req.body.department || "Operations",
    status: req.body.status || "Signed & Completed",
    storageLocation: req.body.storageLocation || "Google Drive",
    remarks: req.body.remarks || "",
    createdBy: req.body.createdBy || "westernassenmenttest@gmail.com",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    auditLog: [
      {
        timestamp: new Date().toISOString(),
        action: "Created",
        changes: "Record created manually",
        user: req.body.createdBy || "westernassenmenttest@gmail.com"
      }
    ]
  };

  docs.unshift(newDoc);
  writeDocuments(docs);
  res.status(201).json(newDoc);
});

app.put("/api/documents/:id", (req, res) => {
  const docs = readDocuments();
  const index = docs.findIndex((d) => d.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Document not found" });
  }

  const existingDoc = docs[index];
  const user = req.body.user || "westernassenmenttest@gmail.com";
  
  // Track changes for audit log
  const changes: string[] = [];
  const fields = ["documentName", "recordDate", "category", "department", "status", "storageLocation", "remarks"];
  fields.forEach((field) => {
    if (req.body[field] !== undefined && req.body[field] !== existingDoc[field]) {
      changes.push(`Updated ${field} from "${existingDoc[field]}" to "${req.body[field]}"`);
    }
  });

  const updatedAuditLog = [...(existingDoc.auditLog || [])];
  if (changes.length > 0) {
    updatedAuditLog.push({
      timestamp: new Date().toISOString(),
      action: "Updated",
      changes: changes.join("; "),
      user: user
    });
  }

  const updatedDoc = {
    ...existingDoc,
    documentName: req.body.documentName !== undefined ? req.body.documentName : existingDoc.documentName,
    recordDate: req.body.recordDate !== undefined ? req.body.recordDate : existingDoc.recordDate,
    category: req.body.category !== undefined ? req.body.category : existingDoc.category,
    department: req.body.department !== undefined ? req.body.department : existingDoc.department,
    status: req.body.status !== undefined ? req.body.status : existingDoc.status,
    storageLocation: req.body.storageLocation !== undefined ? req.body.storageLocation : existingDoc.storageLocation,
    remarks: req.body.remarks !== undefined ? req.body.remarks : existingDoc.remarks,
    updatedAt: new Date().toISOString(),
    auditLog: updatedAuditLog
  };

  docs[index] = updatedDoc;
  writeDocuments(docs);
  res.json(updatedDoc);
});

app.delete("/api/documents/:id", (req, res) => {
  let docs = readDocuments();
  const index = docs.findIndex((d) => d.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Document not found" });
  }
  docs = docs.filter((d) => d.id !== req.params.id);
  writeDocuments(docs);
  res.json({ success: true, message: "Document record deleted" });
});

// Bulk Delete Endpoint
app.post("/api/documents/bulk-delete", (req, res) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids)) {
    return res.status(400).json({ error: "An array of IDs is required" });
  }

  let docs = readDocuments();
  docs = docs.filter((d) => !ids.includes(d.id));
  writeDocuments(docs);
  res.json({ success: true, message: `${ids.length} records bulk-deleted successfully` });
});

// Reset Database Endpoint
app.post("/api/documents/reset", (req, res) => {
  writeDocuments(initialDocuments);
  res.json({ success: true, message: "Database reset to initial template seeds" });
});

// AI Voice Processing Route
app.post("/api/parse-voice", async (req, res) => {
  const { transcript, localDate } = req.body;
  if (!transcript) {
    return res.status(400).json({ error: "Transcript is required" });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not defined. Using smart parsing fallback.");
      return res.json(simulateParsing(transcript, localDate));
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const currentDateStr = localDate || new Date().toISOString().split("T")[0];

    const prompt = `
You are an expert NLP parser for a Personal Signature Record Management System.
Given the user's spoken voice transcript below, parse and extract the structured record fields.
Today's date is: ${currentDateStr} (use this to resolve relative date phrases like "today", "yesterday", "tomorrow", or "July 21, 2026").

Voice transcript: "${transcript}"

Extract the following:
1. documentName: Short, official-sounding name or title for the document. Keep it professional.
2. category: Primary document category (e.g. 'Immigration', 'Legal', 'Finance', 'HR', 'Contract', 'Real Estate', 'Personal'). If not clear, choose the best fit or 'General'.
3. recordDate: YYYY-MM-DD date. If a date is mentioned (e.g. "July 21, 2026" or "on the 15th of last month"), translate it to YYYY-MM-DD format based on today's date ${currentDateStr}. If no date is mentioned, default to the date mentioned or today's date ${currentDateStr}.
4. department: Operations, Finance, or Academics. Choose based on context.
5. status: Document signature status. Usually 'Signed & Completed' unless implied as a 'Draft' or 'Pending Review'.
6. remarks: Concise summary or notes about the document, such as its purpose, who it's for, etc.

Return the parsed result matching the required JSON schema strictly.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            documentName: { type: Type.STRING, description: "Professional name or title of the document" },
            category: { type: Type.STRING, description: "Category of document, e.g. Immigration, Legal, HR, Finance, Contract, etc." },
            recordDate: { type: Type.STRING, description: "YYYY-MM-DD date of signature or record" },
            department: { type: Type.STRING, description: "Department: Operations, Finance, Academics" },
            status: { type: Type.STRING, description: "Signed & Completed, Pending Review, Draft" },
            remarks: { type: Type.STRING, description: "Summary or additional context extracted from the voice statement" }
          },
          required: ["documentName", "category", "recordDate", "department", "status", "remarks"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response text from Gemini API");
    }

    const parsedData = JSON.parse(text.trim());
    res.json(parsedData);

  } catch (error: any) {
    console.error("Gemini parse-voice error:", error);
    // Graceful fallback parsing in case of network errors or missing keys
    const fallback = simulateParsing(transcript, localDate);
    res.json({
      ...fallback,
      remarks: `${fallback.remarks} (Note: Parsed using system fallback due to server connection limit)`
    });
  }
});

// Fallback regex-based parsing to ensure 100% durability and testability
function simulateParsing(transcript: string, localDate?: string) {
  const text = transcript.toLowerCase();
  const today = localDate || new Date().toISOString().split("T")[0];
  
  let documentName = "Voice Note Record";
  let category = "General";
  let department = "Operations";
  let status = "Signed & Completed";
  let recordDate = today;
  let remarks = transcript;

  // Inference logic
  if (text.includes("visa") || text.includes("extension") || text.includes("passport") || text.includes("immigration")) {
    category = "Immigration / Visa";
    department = "Academics";
    documentName = "Visa Extension Document";
  } else if (text.includes("lease") || text.includes("rent") || text.includes("apartment") || text.includes("office")) {
    category = "Real Estate";
    department = "Operations";
    documentName = "Lease Agreement";
  } else if (text.includes("contract") || text.includes("nda") || text.includes("agreement") || text.includes("consulting")) {
    category = "Contract";
    department = "Academics";
    documentName = "Consulting & Service Agreement";
  } else if (text.includes("financial") || text.includes("tax") || text.includes("billing") || text.includes("audit") || text.includes("salary")) {
    category = "Finance";
    department = "Finance";
    documentName = "Financial Document";
  } else if (text.includes("onboarding") || text.includes("employee") || text.includes("hire") || text.includes("recruit")) {
    category = "HR";
    department = "Academics";
    documentName = "Employee Record Document";
  }

  // Attempt to extract title
  const cleanText = transcript.trim();
  if (cleanText.length > 5 && cleanText.length < 60) {
    documentName = cleanText;
  } else {
    // Take first few words
    const words = cleanText.split(" ");
    if (words.length > 1) {
      documentName = words.slice(0, 4).join(" ").replace(/^[tT]he\s+/, "");
      // Capitalize first letter of each word
      documentName = documentName.replace(/\b\w/g, l => l.toUpperCase());
    }
  }

  // Attempt to scan dates
  const dateMatch = transcript.match(/(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}(st|nd|rd|th)?,\s+\d{4}/i);
  if (dateMatch) {
    try {
      const parsedDate = new Date(dateMatch[0]);
      if (!isNaN(parsedDate.getTime())) {
        recordDate = parsedDate.toISOString().split("T")[0];
      }
    } catch (_) {}
  }

  return {
    documentName,
    category,
    recordDate,
    department,
    status,
    remarks
  };
}

// Vite Dev Server Middleware / Build Static Serving Setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
