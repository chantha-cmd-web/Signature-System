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
      bgColor: "bg-indigo-500/10 dark:bg-indigo-400/10",
      iconColor: "text-indigo-600 dark:text-indigo-400",
      accentBorder: "border-indigo-500/20 dark:border-indigo-400/20",
    },
    {
      id: "completed",
      label: "Completed Signatures",
      value: completedDocs,
      description: "Successfully processed & archived",
      icon: CheckCircle2,
      bgColor: "bg-emerald-500/10 dark:bg-emerald-400/10",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      accentBorder: "border-emerald-500/20 dark:border-emerald-400/20",
    },
    {
      id: "pending",
      label: "Pending Verification",
      value: pendingDocs,
      description: "Awaiting legal reviewer check",
      icon: Clock,
      bgColor: "bg-amber-500/10 dark:bg-amber-400/10",
      iconColor: "text-amber-600 dark:text-amber-400",
      accentBorder: "border-amber-500/20 dark:border-amber-400/20",
    },
    {
      id: "drafts",
      label: "Draft Documents",
      value: draftDocs,
      description: "In preparation state",
      icon: FileEdit,
      bgColor: "bg-sky-500/10 dark:bg-sky-400/10",
      iconColor: "text-sky-600 dark:text-sky-400",
      accentBorder: "border-sky-500/20 dark:border-sky-400/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" id="dashboard-stats-grid">
      {statItems.map((item, idx) => {
        const IconComponent = item.icon;
        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
            className={`glass-card p-5 rounded-2xl border ${item.accentBorder} flex flex-col justify-between`}
          >
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <span className="text-xs font-extrabold tracking-wider uppercase text-muted-foreground/85 block sm:text-[13px]">
                  {item.label}
                </span>
                <span className="text-3xl font-extrabold tracking-tight font-mono text-foreground block sm:text-4xl">
                  {item.value}
                </span>
              </div>
              <div className={`p-2.5 rounded-xl shrink-0 ${item.bgColor} ${item.iconColor} transition-transform duration-300 hover:scale-110`}>
                <IconComponent className="h-5 w-5" strokeWidth={2} />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-border/20">
              <p className="text-xs text-muted-foreground/80 leading-relaxed font-semibold">
                {item.description}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
