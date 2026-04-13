import { useState } from "react";
import { useMessInfo } from "@/hooks/useMessInfo";
import { useDailyMenu } from "@/hooks/useMenus";
import { useDashboardStats, useEnrolledStudents } from "@/hooks/useOwnerData";
import { useManualCheckIn } from "@/hooks/useAttendance";
import MealCard from "@/components/MealCard";
import StatCard from "@/components/StatCard";
import { PageSkeleton, ErrorDisplay } from "@/components/LoadingSkeleton";
import { Users, UtensilsCrossed, TrendingUp, DollarSign, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const OwnerDashboard = () => {
  const { data: messInfo, isLoading: messLoading } = useMessInfo();
  const { data: dailyMenu, isLoading: menuLoading } = useDailyMenu();
  const { data: stats, isLoading: statsLoading, error } = useDashboardStats();
  const { data: students = [] } = useEnrolledStudents();
  const manualCheckIn = useManualCheckIn();
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [mealType, setMealType] = useState<"breakfast" | "lunch" | "dinner">("lunch");

  if (messLoading || menuLoading || statsLoading) return <PageSkeleton />;
  if (error) return <ErrorDisplay message="Failed to load dashboard data" onRetry={() => window.location.reload()} />;

  const handleManualCheckIn = async () => {
    if (!selectedStudentId) {
      toast.error("Please select a student");
      return;
    }
    try {
      await manualCheckIn.mutateAsync({ studentId: selectedStudentId, mealType });
      toast.success("Attendance marked manually");
      setSelectedStudentId("");
    } catch (err: any) {
      toast.error(err.message || "Failed to mark attendance");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Total Students"
          value={stats?.enrolledCount || 0}
          subtitle={`/ ${stats?.capacity || 200} capacity`}
          variant="primary"
        />
        <StatCard
          icon={UtensilsCrossed}
          label="Meals Today"
          value={stats?.mealsToday || 0}
          subtitle="across all meals"
          variant="default"
        />
        <StatCard
          icon={DollarSign}
          label="Revenue"
          value={`₹${(stats?.totalRevenue || 0).toLocaleString()}`}
          variant="info"
        />
        <StatCard
          icon={TrendingUp}
          label="Attendance Rate"
          value={`${stats?.attendanceRate || 0}%`}
          variant="warning"
        />
      </div>

      {/* Menu Management */}
      {messInfo && dailyMenu && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-foreground">🍽️ Menu Management</h2>
            <Button variant="outline" size="sm" onClick={() => toast.info("Menu editing mode")}>
              Edit Menu
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MealCard title="Breakfast" time={messInfo.timings.breakfast} items={dailyMenu.breakfast} type="breakfast" />
            <MealCard title="Lunch" time={messInfo.timings.lunch} items={dailyMenu.lunch} type="lunch" />
            <MealCard title="Dinner" time={messInfo.timings.dinner} items={dailyMenu.dinner} type="dinner" />
          </div>
        </div>
      )}

      {/* Manual Override */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="text-lg font-semibold text-foreground mb-3">🟡 Manual Override</h2>
        <p className="text-sm text-muted-foreground mb-4">Mark attendance manually if QR check-in fails</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select a student" />
            </SelectTrigger>
            <SelectContent>
              {(!students || students.length === 0) ? (
                <SelectItem value="" disabled>
                  No students enrolled
                </SelectItem>
              ) : (
                students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.name} ({student.email})
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <select
            value={mealType}
            onChange={(e) => setMealType(e.target.value as any)}
            className="h-10 px-3 rounded-lg border border-input bg-background text-foreground text-sm"
          >
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
          </select>
          <Button onClick={handleManualCheckIn} disabled={manualCheckIn.isPending}>
            <UserCheck className="w-4 h-4 mr-2" /> Mark Present
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
