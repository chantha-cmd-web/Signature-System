import React from "react";
import { DocumentRecord } from "../types";
import { FileText, CheckCircle2, Clock, FileEdit } from "lucide-react";
import { motion } from "motion/react";

interface DashboardStatsProps {
  documents: DocumentRecord[];
  onSelectCategory?: (category: string) => void;
  selectedCategory?: string;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  documents,
}) => {
  const totalDocs = documents.length;

  const completedDocs = documents.filter((doc) => doc.status === "Signed & Completed").length;
  const pendingDocs = documents.filter((doc) => doc.status === "Pending Review").length;
  const draftDocs = documents.filter((doc) => doc.status === "Draft").length;

  const statItems = [
    {
      id: "total",
      label: "Total Signed Docs",
      value: totalDocs,
      description: "Registered in digital ledger",
      icon: FileText,
      bgColor: "bg-indigo-500/10 dark:bg-indigo-950/20",
      iconColor: "text-indigo-600 dark:text-indigo-400",
      borderColor: "border-indigo-500/15",
    },
    {
      id: "completed",
      label: "Completed Signatures",
      value: completedDocs,
      description: "Successfully processed & archived",
      icon: CheckCircle2,
      bgColor: "bg-emerald-500/10 dark:bg-emerald-950/20",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      borderColor: "border-emerald-500/15",
    },
    {
      id: "pending",
      label: "Pending Verification",
      value: pendingDocs,
      description: "Awaiting legal reviewer check",
      icon: Clock,
      bgColor: "bg-amber-500/10 dark:bg-amber-950/20",
      iconColor: "text-amber-600 dark:text-amber-400",
      borderColor: "border-amber-500/15",
    },
    {
      id: "drafts",
      label: "Draft Documents",
      value: draftDocs,
      description: "In preparation state",
      icon: FileEdit,
      bgColor: "bg-blue-500/10 dark:bg-blue-950/20",
      iconColor: "text-blue-600 dark:text-blue-400",
      borderColor: "border-blue-500/15",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" id="dashboard-stats-grid">
      {statItems.map((item, idx) => {
        const IconComponent = item.icon;
        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            className={`p-5 rounded-xl border bg-card text-card-foreground shadow-xs flex flex-col justify-between hover:shadow-md transition-all duration-200 ${item.borderColor}`}
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground block">
                  {item.label}
                </span>
                <span className="text-3xl font-extrabold tracking-tight font-mono text-foreground block">
                  {item.value}
                </span>
              </div>
              <div className={`p-2.5 rounded-lg shrink-0 ${item.bgColor} ${item.iconColor}`}>
                <IconComponent className="h-5 w-5" />
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground mt-4 leading-normal">
              {item.description}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
};
