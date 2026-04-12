import { useAllStudents } from "@/hooks/useOwnerData";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { PageSkeleton, ErrorDisplay, StudentCardSkeleton } from "@/components/LoadingSkeleton";

const OwnerStudents = () => {
  const navigate = useNavigate();
  const { data: students, isLoading, error } = useAllStudents();
  const [search, setSearch] = useState("");

  if (isLoading) return (
    <div className="space-y-6">
      <div className="h-8 w-32 animate-pulse bg-muted rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => <StudentCardSkeleton key={i} />)}
      </div>
    </div>
  );
  if (error) return <ErrorDisplay message="Failed to load students" onRetry={() => window.location.reload()} />;

  const filtered = (students || []).filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">Students</h1>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search students..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {search ? "No students matching your search" : "No enrolled students yet"}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate(`/owner/students/${s.id}`)}
              className="bg-card border border-border rounded-xl p-4 cursor-pointer hover:border-primary/40 transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                  {s.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-muted rounded-lg py-2">
                  <p className="text-sm font-bold text-foreground">{s.plan}</p>
                  <p className="text-xs text-muted-foreground">Plan</p>
                </div>
                <div className="bg-muted rounded-lg py-2">
                  <p className="text-sm font-bold text-foreground">{s.remainingDays}</p>
                  <p className="text-xs text-muted-foreground">Days Left</p>
                </div>
                <div className="bg-muted rounded-lg py-2">
                  <p className="text-sm font-bold text-foreground">₹{s.balance}</p>
                  <p className="text-xs text-muted-foreground">Balance</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OwnerStudents;
