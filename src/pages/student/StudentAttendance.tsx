import { useStudentAttendance } from "@/hooks/useStudentData";
import { PageSkeleton, ErrorDisplay } from "@/components/LoadingSkeleton";
import { motion } from "framer-motion";

const StudentAttendance = () => {
  const { data: attendance, isLoading, error } = useStudentAttendance();

  if (isLoading) return <PageSkeleton />;
  if (error) return <ErrorDisplay message="Failed to load attendance" onRetry={() => window.location.reload()} />;

  const records = attendance || [];
  const presentDays = records.filter((a) => a.status === "present").length;
  const leaveDays = records.filter((a) => a.status === "leave").length;
  const absentDays = records.filter((a) => a.status === "absent").length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Attendance</h1>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-accent border border-primary/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-primary">{presentDays}</p>
          <p className="text-xs text-muted-foreground">Present</p>
        </div>
        <div className="bg-warning/10 border border-warning/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-warning">{leaveDays}</p>
          <p className="text-xs text-muted-foreground">Leave</p>
        </div>
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-destructive">{absentDays}</p>
          <p className="text-xs text-muted-foreground">Absent</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Breakfast</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Lunch</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Dinner</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No attendance records yet</td>
                </tr>
              ) : (
                records.map((record, i) => (
                  <motion.tr
                    key={record.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-4 py-3 text-foreground">{record.date}</td>
                    <td className="px-4 py-3 text-center">{record.breakfast ? "✅" : "❌"}</td>
                    <td className="px-4 py-3 text-center">{record.lunch ? "✅" : "❌"}</td>
                    <td className="px-4 py-3 text-center">{record.dinner ? "✅" : "❌"}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        record.status === "present" ? "bg-accent text-accent-foreground" :
                        record.status === "leave" ? "bg-warning/10 text-warning" :
                        "bg-destructive/10 text-destructive"
                      }`}>
                        {record.status}
                      </span>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentAttendance;
