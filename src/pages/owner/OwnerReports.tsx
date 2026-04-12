import { useAllStudents, useAllPayments } from "@/hooks/useOwnerData";
import { PageSkeleton, ErrorDisplay } from "@/components/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";

const OwnerReports = () => {
  const { data: students, isLoading: studentsLoading } = useAllStudents();
  const { data: payments, isLoading: paymentsLoading, error } = useAllPayments();

  if (studentsLoading || paymentsLoading) return <PageSkeleton />;
  if (error) return <ErrorDisplay message="Failed to load reports" onRetry={() => window.location.reload()} />;

  // Build attendance logs from students' recent attendance
  const attendanceLogs = (students || []).flatMap((s) =>
    s.attendance.slice(-3).map((a) => ({
      key: `${s.id}-${a.date}`,
      studentName: s.name,
      date: a.date,
      status: a.status,
      meals: [a.breakfast && "B", a.lunch && "L", a.dinner && "D"].filter(Boolean).join(", ") || "—",
    }))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Reports & Logs</h1>
        <Button variant="outline" size="sm" onClick={() => toast.info("Export coming soon")}>
          <Download className="w-4 h-4 mr-2" /> Export
        </Button>
      </div>

      {/* Attendance Logs */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="font-semibold text-foreground">Attendance Logs</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Student</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Meals</th>
              </tr>
            </thead>
            <tbody>
              {attendanceLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No attendance logs</td>
                </tr>
              ) : (
                attendanceLogs.map((log) => (
                  <tr key={log.key} className="border-b border-border last:border-0">
                    <td className="px-4 py-2.5 text-foreground">{log.studentName}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{log.date}</td>
                    <td className="px-4 py-2.5 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        log.status === "present" ? "bg-accent text-accent-foreground" :
                        log.status === "leave" ? "bg-warning/10 text-warning" :
                        "bg-destructive/10 text-destructive"
                      }`}>{log.status}</span>
                    </td>
                    <td className="px-4 py-2.5 text-center text-muted-foreground">{log.meals}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Logs */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="font-semibold text-foreground">Payment Logs</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">ID</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Description</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Method</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Amount</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {(!payments || payments.length === 0) ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No payment logs</td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-2.5 text-foreground font-mono text-xs">{p.id.substring(0, 8)}...</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{p.date}</td>
                    <td className="px-4 py-2.5 text-foreground">{p.description}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{p.method}</td>
                    <td className="px-4 py-2.5 text-right font-medium text-foreground">₹{p.amount.toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        p.status === "paid" ? "bg-accent text-accent-foreground" :
                        p.status === "pending" ? "bg-warning/10 text-warning" :
                        "bg-destructive/10 text-destructive"
                      }`}>{p.status}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OwnerReports;
