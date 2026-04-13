import { useAuth } from "@/context/AuthContext";
import { useMessInfo } from "@/hooks/useMessInfo";
import { useDailyMenu, useFestivalMenu } from "@/hooks/useMenus";
import { useStudentEnrollment, useStudentAttendance } from "@/hooks/useStudentData";
import MealCard from "@/components/MealCard";
import StatCard from "@/components/StatCard";
import { PageSkeleton, ErrorDisplay } from "@/components/LoadingSkeleton";
import { UtensilsCrossed, CalendarCheck, CreditCard, TrendingUp, Sparkles } from "lucide-react";

const StudentDashboard = () => {
  const { user } = useAuth();
  const { data: messInfo, isLoading: messLoading } = useMessInfo();
  const { data: dailyMenu, isLoading: menuLoading } = useDailyMenu();
  const { data: festivalMenu, isLoading: festivalLoading } = useFestivalMenu();
  const { data: enrollment, isLoading: enrollLoading } = useStudentEnrollment();
  const { data: attendance, isLoading: attLoading } = useStudentAttendance();

  const isLoading = messLoading || menuLoading || festivalLoading || enrollLoading || attLoading;

  if (isLoading) return <PageSkeleton />;

  const totalMeals = (attendance || []).reduce(
    (sum, a) => sum + (a.breakfast ? 1 : 0) + (a.lunch ? 1 : 0) + (a.dinner ? 1 : 0),
    0
  );
  const presentDays = (attendance || []).filter((a) => a.status === "present").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back, {user?.name?.split(" ")[0] || "Student"}!
        </h1>
        <p className="text-muted-foreground text-sm">Here's your mess overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={CalendarCheck}
          label="Present Days"
          value={presentDays}
          subtitle={`of ${(attendance || []).length}`}
          variant="primary"
        />
        <StatCard icon={UtensilsCrossed} label="Meals Eaten" value={totalMeals} variant="default" />
        <StatCard
          icon={CreditCard}
          label="Balance"
          value={`₹${enrollment?.balance || 0}`}
          subtitle={`${enrollment?.remaining_days || 0} days left`}
          variant="info"
        />
        <StatCard
          icon={TrendingUp}
          label="Plan"
          value={enrollment ? "Active" : "N/A"}
          subtitle={enrollment ? `${enrollment.remaining_days} days` : ""}
          variant="warning"
        />
      </div>

      {/* Today's Menu */}
      {messInfo && dailyMenu && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3">Today's Menu</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MealCard title="Breakfast" time={messInfo.timings.breakfast} items={dailyMenu.breakfast} type="breakfast" />
            <MealCard title="Lunch" time={messInfo.timings.lunch} items={dailyMenu.lunch} type="lunch" />
            <MealCard title="Dinner" time={messInfo.timings.dinner} items={dailyMenu.dinner} type="dinner" />
          </div>
        </div>
      )}

      {/* Festival Special */}
      {messInfo && festivalMenu && messInfo.festivalMode && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-secondary" />
            <h2 className="text-lg font-semibold text-foreground">Festival Special</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MealCard title="Special Breakfast" time={messInfo.timings.breakfast} items={festivalMenu.breakfast} type="breakfast" />
            <MealCard title="Special Lunch" time={messInfo.timings.lunch} items={festivalMenu.lunch} type="lunch" />
            <MealCard title="Special Dinner" time={messInfo.timings.dinner} items={festivalMenu.dinner} type="dinner" />
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
