import { useAllStudents, useDashboardStats } from "@/hooks/useOwnerData";
import { useMessInfo } from "@/hooks/useMessInfo";
import { PageSkeleton, ErrorDisplay } from "@/components/LoadingSkeleton";
import StatCard from "@/components/StatCard";
import { Users, UserCheck, UserX, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const OwnerAttendance = () => {
  const { data: students, isLoading: studentsLoading } = useAllStudents();
  const { data: stats, isLoading: statsLoading, error } = useDashboardStats();
  const { data: messInfo } = useMessInfo();

  if (studentsLoading || statsLoading) return <PageSkeleton />;
  if (error) return <ErrorDisplay message="Failed to load attendance data" onRetry={() => window.location.reload()} />;

  const mealData = [
    { meal: "Breakfast", present: 0, absent: 0 },
    { meal: "Lunch", present: 0, absent: 0 },
    { meal: "Dinner", present: 0, absent: 0 },
  ];

  // Build today's meal-wise data from student attendance
  const today = new Date().toISOString().split("T")[0];
  (students || []).forEach((s) => {
    const todayRecord = s.attendance.find((a) => a.date === today);
    if (todayRecord) {
      if (todayRecord.breakfast) mealData[0].present++;
      else mealData[0].absent++;
      if (todayRecord.lunch) mealData[1].present++;
      else mealData[1].absent++;
      if (todayRecord.dinner) mealData[2].present++;
      else mealData[2].absent++;
    }
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Daily Attendance</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Students" value={stats?.enrolledCount || 0} variant="default" />
        <StatCard icon={UserCheck} label="Present Today" value={stats?.presentToday || 0} variant="primary" />
        <StatCard icon={UserX} label="Absent" value={stats?.absentToday || 0} variant="warning" />
        <StatCard icon={Clock} label="On Leave" value={stats?.leaveToday || 0} variant="info" />
      </div>

      {/* Chart */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-semibold text-foreground mb-4">Meal-wise Attendance</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mealData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 90%)" />
              <XAxis dataKey="meal" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="present" fill="hsl(142, 52%, 36%)" radius={[4, 4, 0, 0]} name="Present" />
              <Bar dataKey="absent" fill="hsl(38, 92%, 50%)" radius={[4, 4, 0, 0]} name="Absent" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Student List */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="font-semibold text-foreground">Today's Records</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Student</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Breakfast</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Lunch</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Dinner</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {(!students || students.length === 0) ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No students enrolled yet</td>
                </tr>
              ) : (
                students.map((s) => {
                  const todayRecord = s.attendance.find((a) => a.date === today);
                  return (
                    <tr key={s.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3">
                        <p className="text-foreground font-medium">{s.name}</p>
                        <p className="text-xs text-muted-foreground">{s.email}</p>
                      </td>
                      <td className="px-4 py-3 text-center">{todayRecord?.breakfast ? "✅" : "❌"}</td>
                      <td className="px-4 py-3 text-center">{todayRecord?.lunch ? "✅" : "❌"}</td>
                      <td className="px-4 py-3 text-center">{todayRecord?.dinner ? "✅" : "❌"}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          todayRecord?.status === "present" ? "bg-accent text-accent-foreground" :
                          todayRecord?.status === "leave" ? "bg-warning/10 text-warning" :
                          "bg-destructive/10 text-destructive"
                        }`}>
                          {todayRecord?.status || "N/A"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OwnerAttendance;
