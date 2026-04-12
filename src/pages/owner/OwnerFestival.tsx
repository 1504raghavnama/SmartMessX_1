import { useState } from "react";
import { useMessInfo, useUpdateFestivalMode } from "@/hooks/useMessInfo";
import { useFestivalMenu } from "@/hooks/useMenus";
import MealCard from "@/components/MealCard";
import { PageSkeleton, ErrorDisplay, MealCardSkeleton } from "@/components/LoadingSkeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const OwnerFestival = () => {
  const { data: messInfo, isLoading: messLoading, error } = useMessInfo();
  const { data: festivalMenu, isLoading: menuLoading } = useFestivalMenu();
  const { toggleFestivalMode } = useUpdateFestivalMode();
  const queryClient = useQueryClient();
  const [toggling, setToggling] = useState(false);

  if (messLoading) return <PageSkeleton />;
  if (error) return <ErrorDisplay message="Failed to load festival settings" onRetry={() => window.location.reload()} />;

  const festivalMode = messInfo?.festivalMode || false;

  const handleToggle = async (v: boolean) => {
    setToggling(true);
    try {
      await toggleFestivalMode(v);
      queryClient.invalidateQueries({ queryKey: ["messInfo"] });
      toast.success(v ? "Festival mode activated!" : "Festival mode deactivated");
    } catch (err: any) {
      toast.error(err.message || "Failed to toggle festival mode");
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Festival Mode</h1>

      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-secondary" />
            <div>
              <Label className="text-base font-semibold text-foreground">Enable Festival Mode</Label>
              <p className="text-sm text-muted-foreground">Activate special menu for all students</p>
            </div>
          </div>
          <Switch
            checked={festivalMode}
            disabled={toggling}
            onCheckedChange={handleToggle}
          />
        </div>
      </div>

      {festivalMode && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3">🎉 Special Festival Menu</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {menuLoading ? (
              <>{[1, 2, 3].map((i) => <MealCardSkeleton key={i} />)}</>
            ) : festivalMenu && messInfo ? (
              <>
                <MealCard title="Special Breakfast" time={messInfo.timings.breakfast} items={festivalMenu.breakfast} type="breakfast" />
                <MealCard title="Special Lunch" time={messInfo.timings.lunch} items={festivalMenu.lunch} type="lunch" />
                <MealCard title="Special Dinner" time={messInfo.timings.dinner} items={festivalMenu.dinner} type="dinner" />
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerFestival;
