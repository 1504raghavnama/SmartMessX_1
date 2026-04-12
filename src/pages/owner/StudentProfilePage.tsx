import { useParams, useNavigate } from "react-router-dom";
import { useStudentById } from "@/hooks/useOwnerData";
import StatCard from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CalendarCheck, UtensilsCrossed, CreditCard, Clock } from "lucide-react";
import { toast } from "sonner";
import { PageSkeleton, ErrorDisplay } from "@/components/LoadingSkeleton";

const StudentProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: student, isLoading, error } = useStudentById(id);

  if (isLoading) return <PageSkeleton />;
  if (error) return <ErrorDisplay message="Failed to load student profile" onRetry={() => window.location.reload()} />;
  if (!student) return <div className="p-6 text-foreground">Student not found</div>;

  const presentDays = student.attendance.filter((a) => a.status === "present").length;
  const leaveDays = student.attendance.filter((a) => a.status === "leave").length;
  const totalMeals = student.attendance.reduce((s, a) => s + (a.breakfast ? 1 : 0) + (a.lunch ? 1 : 0) + (a.dinner ? 1 : 0), 0);

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate(-1)} className="text-muted-foreground">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Students
      </Button>

      {/* Profile Header */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
            {student.name.split(" ").map((n) => n[0]).join("")}
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">{student.name}</h1>
            <p className="text-sm text-muted-foreground">{student.email} · {student.phone}</p>
            <p className="text-xs text-muted-foreground mt-1">Enrolled: {student.enrolledDate}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={CalendarCheck} label="Present Days" value={presentDays} variant="primary" />
        <StatCard icon={Clock} label="Leaves" value={leaveDays} variant="warning" />
        <StatCard icon={UtensilsCrossed} label="Total Meals" value={totalMeals} variant="default" />
        <StatCard icon={CreditCard} label="Balance" value={`₹${student.balance}`} variant="info" />
      </div>

      {/* Attendance */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="font-semibold text-foreground">Attendance History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">B</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">L</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">D</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {student.attendance.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No attendance records</td>
                </tr>
              ) : (
                student.attendance.map((a) => (
                  <tr key={a.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-2.5 text-foreground">{a.date}</td>
                    <td className="px-4 py-2.5 text-center">{a.breakfast ? "✅" : "❌"}</td>
                    <td className="px-4 py-2.5 text-center">{a.lunch ? "✅" : "❌"}</td>
                    <td className="px-4 py-2.5 text-center">{a.dinner ? "✅" : "❌"}</td>
                    <td className="px-4 py-2.5 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        a.status === "present" ? "bg-accent text-accent-foreground" :
                        a.status === "leave" ? "bg-warning/10 text-warning" :
                        "bg-destructive/10 text-destructive"
                      }`}>{a.status}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={() => toast.success("Balance carried forward")} variant="outline">Carry Forward Balance</Button>
        <Button onClick={() => toast.success("Refund initiated")} variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10">Initiate Refund</Button>
      </div>
    </div>
  );
};

export default StudentProfilePage;
