import React from "react";
import { DocumentRecord } from "../types";
import { FileText, Calendar, Layers, Archive, Activity } from "lucide-react";
import { motion } from "motion/react";

interface DashboardStatsProps {
  documents: DocumentRecord[];
  onSelectCategory: (category: string) => void;
  selectedCategory: string;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  documents,
  onSelectCategory,
  selectedCategory,
}) => {
  const totalDocs = documents.length;

  // Documents signed this month (July 2026 based on mock current time "2026-07-21")
  const currentMonthDocs = documents.filter((doc) => {
    if (!doc.recordDate) return false;
    const dateObj = new Date(doc.recordDate);
    const now = new Date("2026-07-21");
    return (
      dateObj.getMonth() === now.getMonth() &&
      dateObj.getFullYear() === now.getFullYear()
    );
  }).length;

  // Group by category
  const categoriesMap: Record<string, number> = {};
  documents.forEach((doc) => {
    const cat = doc.category || "General";
    categoriesMap[cat] = (categoriesMap[cat] || 0) + 1;
  });

  const categoriesData = Object.entries(categoriesMap).map(([name, value]) => ({
    name,
    value,
  }));

  // Group by status
  const statusMap: Record<string, number> = {
    "Signed & Completed": 0,
    "Pending Review": 0,
    Draft: 0,
  };
  documents.forEach((doc) => {
    if (statusMap[doc.status] !== undefined) {
      statusMap[doc.status]++;
    }
  });

  // Calculate percentage of category for radial/bar chart
  const maxCategoryValue = Math.max(...categoriesData.map((d) => d.value), 1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
      {/* Left 2 Columns: Stats Grid */}
      <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Stat Card 1: Total Recorded */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-4 rounded-lg border bg-card text-card-foreground shadow-xs transition-all duration-300 relative overflow-hidden"
          id="stat-card-total"
        >
          <div className="flex justify-between items-start">
            <div>
              <span className="micro-label">
                Total Signed Documents
              </span>
              <div className="stat-val mt-1">
                {totalDocs}
              </div>
            </div>
            <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded">
              <FileText className="h-5 w-5" id="icon-total-docs" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="font-semibold text-emerald-500 flex items-center gap-0.5">
              <Activity className="h-3 w-3" /> Live
            </span>
            <span>Digital Ledger System</span>
          </div>
        </motion.div>

        {/* Stat Card 2: Signed This Month */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="p-4 rounded-lg border bg-card text-card-foreground shadow-xs transition-all duration-300 relative overflow-hidden"
          id="stat-card-month"
        >
          <div className="flex justify-between items-start">
            <div>
              <span className="micro-label">
                Recorded This Month
              </span>
              <div className="stat-val mt-1 text-primary">
                {currentMonthDocs}
              </div>
            </div>
            <div className="p-2 bg-amber-500/10 text-amber-500 rounded">
              <Calendar className="h-5 w-5" id="icon-month-docs" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1 text-[11px] text-muted-foreground">
            <span className="font-semibold text-amber-500">July 2026</span>
            <span>Current Billing Cycle</span>
          </div>
        </motion.div>

        {/* Stat Card 3: Storage Locations */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="p-4 rounded-lg border bg-card text-card-foreground shadow-xs transition-all duration-300 sm:col-span-2"
          id="stat-card-status"
        >
          <div className="flex justify-between items-center mb-2.5">
            <div>
              <span className="micro-label">
                Document Status Registry
              </span>
              <h4 className="text-xs text-muted-foreground">
                Overview of active signature states
              </h4>
            </div>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </div>

          <div className="grid grid-cols-3 gap-2 pt-0.5">
            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded p-2 text-center">
              <div className="text-[10px] text-emerald-500 font-bold uppercase mb-0.5">Completed</div>
              <div className="text-lg font-bold text-foreground font-mono">
                {statusMap["Signed & Completed"]}
              </div>
            </div>
            <div className="bg-amber-500/5 border border-amber-500/10 rounded p-2 text-center">
              <div className="text-[10px] text-amber-500 font-bold uppercase mb-0.5">Pending</div>
              <div className="text-lg font-bold text-foreground font-mono">
                {statusMap["Pending Review"]}
              </div>
            </div>
            <div className="bg-blue-500/5 border border-blue-500/10 rounded p-2 text-center">
              <div className="text-[10px] text-blue-500 font-bold uppercase mb-0.5">Draft</div>
              <div className="text-lg font-bold text-foreground font-mono">
                {statusMap["Draft"]}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Column: Category Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="p-4 rounded-lg border bg-card text-card-foreground shadow-xs flex flex-col justify-between"
        id="stat-card-categories"
      >
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="micro-label mb-0">
              Documents by Category
            </span>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </div>

          <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
            {categoriesData.length === 0 ? (
              <div className="text-center py-4 text-[11px] text-muted-foreground">
                No categories found.
              </div>
            ) : (
              categoriesData
                .sort((a, b) => b.value - a.value)
                .map((cat, idx) => {
                  const percent = Math.round((cat.value / totalDocs) * 100) || 0;
                  const isSelected = selectedCategory === cat.name;
                  return (
                    <div
                      key={cat.name}
                      onClick={() => onSelectCategory(isSelected ? "" : cat.name)}
                      className={`group cursor-pointer p-1 rounded transition-all duration-150 ${
                        isSelected
                          ? "bg-primary/5 border-l-2 border-primary pl-2"
                          : "hover:bg-accent/40 border-l-2 border-transparent pl-1"
                      }`}
                      id={`category-bar-${idx}`}
                    >
                      <div className="flex justify-between text-[11px] mb-0.5">
                        <span className="font-semibold text-foreground group-hover:text-primary transition-colors truncate max-w-[120px]">
                          {cat.name}
                        </span>
                        <span className="text-muted-foreground font-mono text-[10px]">
                          {cat.value} ({percent}%)
                        </span>
                      </div>
                      <div className="w-full bg-accent/60 h-1 rounded-full overflow-hidden">
                        <div
                          className="bg-primary h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${(cat.value / maxCategoryValue) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>

        <div className="pt-2 border-t border-border mt-2 text-[10px] text-muted-foreground flex justify-between items-center">
          <span>Click to toggle filter</span>
          {selectedCategory && (
            <button
              onClick={() => onSelectCategory("")}
              className="text-primary hover:underline font-bold"
            >
              Clear Filter
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
