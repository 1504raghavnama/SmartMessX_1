import { useState } from "react";
import { useMessInfo } from "@/hooks/useMessInfo";
import { useDailyMenu, useAllMenuItems, useSaveMenu } from "@/hooks/useMenus";
import { useDashboardStats, useEnrolledStudents } from "@/hooks/useOwnerData";
import { useManualCheckIn } from "@/hooks/useAttendance";
import MealCard from "@/components/MealCard";
import StatCard from "@/components/StatCard";
import { PageSkeleton, ErrorDisplay } from "@/components/LoadingSkeleton";
import { Users, UtensilsCrossed, TrendingUp, DollarSign, UserCheck, X } from "lucide-react";
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
  const { data: allMenuItems = [] } = useAllMenuItems();
  const manualCheckIn = useManualCheckIn();
  
  const today = new Date().toISOString().split("T")[0];
  const saveMenuMutation = useSaveMenu(today);
  
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [mealType, setMealType] = useState<"breakfast" | "lunch" | "dinner">("lunch");
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedMenu, setEditedMenu] = useState<{
    breakfast: string[];
    lunch: string[];
    dinner: string[];
  }>({ breakfast: [], lunch: [], dinner: [] });

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

  const handleEditMenu = () => {
    setIsEditMode(true);
    // Initialize with current menu item IDs (or empty if no items)
    setEditedMenu({
      breakfast: [],
      lunch: [],
      dinner: [],
    });
  };

  const handleAddItemToMeal = (mealType: keyof typeof editedMenu, itemId: string) => {
    setEditedMenu((prev) => ({
      ...prev,
      [mealType]: [...prev[mealType], itemId],
    }));
  };

  const handleRemoveItemFromMeal = (mealType: keyof typeof editedMenu, index: number) => {
    setEditedMenu((prev) => ({
      ...prev,
      [mealType]: prev[mealType].filter((_, i) => i !== index),
    }));
  };

  const handleSaveMenu = async () => {
    try {
      await saveMenuMutation.mutateAsync(editedMenu);
      toast.success("Menu saved successfully");
      setIsEditMode(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to save menu");
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
            {!isEditMode && (
              <Button variant="outline" size="sm" onClick={handleEditMenu}>
                Edit Menu
              </Button>
            )}
          </div>

          {isEditMode ? (
            // Edit Mode
            <div className="bg-card border border-border rounded-xl p-5 space-y-5">
              {(["breakfast", "lunch", "dinner"] as const).map((meal) => (
                <div key={meal}>
                  <h3 className="font-semibold text-foreground mb-3 capitalize">{meal}</h3>
                  
                  {/* Selected Items */}
                  <div className="mb-3 space-y-2">
                    {editedMenu[meal].map((itemId, idx) => {
                      const item = allMenuItems.find((m) => m.id === itemId);
                      return (
                        <div key={idx} className="flex items-center gap-2 bg-muted p-2 rounded">
                          <span className="flex-1 text-sm">{item?.name || "Item"}</span>
                          <button
                            onClick={() => handleRemoveItemFromMeal(meal, idx)}
                            className="text-destructive hover:opacity-70"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Add Items Dropdown */}
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleAddItemToMeal(meal, e.target.value);
                        e.target.value = "";
                      }
                    }}
                    className="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm"
                  >
                    <option value="">Add item...</option>
                    {allMenuItems.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>
              ))}

              {/* Save/Cancel Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveMenu}
                  disabled={saveMenuMutation.isPending}
                  className="flex-1"
                >
                  {saveMenuMutation.isPending ? "Saving..." : "Save Menu"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsEditMode(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            // View Mode
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MealCard title="Breakfast" time={messInfo.timings.breakfast} items={dailyMenu.breakfast} type="breakfast" />
              <MealCard title="Lunch" time={messInfo.timings.lunch} items={dailyMenu.lunch} type="lunch" />
              <MealCard title="Dinner" time={messInfo.timings.dinner} items={dailyMenu.dinner} type="dinner" />
            </div>
          )}
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
