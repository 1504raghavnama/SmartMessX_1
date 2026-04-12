import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useMessInfo } from "@/hooks/useMessInfo";
import { useDailyMenu, useFestivalMenu } from "@/hooks/useMenus";
import MealCard from "@/components/MealCard";
import { MealCardSkeleton, ErrorDisplay } from "@/components/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Phone, Sparkles, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const StudentHomeBefore = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: messInfo, isLoading: messLoading, error: messError } = useMessInfo();
  const { data: dailyMenu, isLoading: menuLoading } = useDailyMenu();
  const { data: festivalMenu, isLoading: festivalLoading } = useFestivalMenu();

  if (messError) {
    return <ErrorDisplay message="Failed to load mess information" onRetry={() => window.location.reload()} />;
  }

  const isLoading = messLoading || menuLoading || festivalLoading;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-primary px-4 py-12 lg:px-6 lg:py-16 text-center relative overflow-hidden">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl lg:text-4xl font-bold text-primary-foreground">
            {messLoading ? "Loading..." : messInfo?.name}
          </h1>
          <p className="text-primary-foreground/80 mt-3 max-w-lg mx-auto text-sm lg:text-base">
            {messInfo?.description}
          </p>
          <Button
            onClick={() => navigate("/student/enroll")}
            className="mt-6 bg-card text-foreground hover:bg-card/90 font-semibold h-11 px-6"
          >
            Enroll Now <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </motion.div>
      </div>

      <div className="max-w-5xl mx-auto p-4 lg:p-6 space-y-8">
        {/* Info Cards */}
        {messInfo && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-start gap-3 bg-card border border-border rounded-xl p-4">
              <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">Address</p>
                <p className="text-xs text-muted-foreground">{messInfo.address}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-card border border-border rounded-xl p-4">
              <Clock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">Timings</p>
                <p className="text-xs text-muted-foreground">Breakfast: {messInfo.timings.breakfast}</p>
                <p className="text-xs text-muted-foreground">Lunch: {messInfo.timings.lunch}</p>
                <p className="text-xs text-muted-foreground">Dinner: {messInfo.timings.dinner}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-card border border-border rounded-xl p-4">
              <Phone className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">Contact</p>
                <p className="text-xs text-muted-foreground">{messInfo.contact}</p>
              </div>
            </div>
          </div>
        )}

        {/* Daily Menu */}
        <div>
          <h2 className="text-xl font-bold text-foreground mb-4">Today's Menu</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {isLoading ? (
              <>{[1, 2, 3].map((i) => <MealCardSkeleton key={i} />)}</>
            ) : dailyMenu && messInfo ? (
              <>
                <MealCard title="Breakfast" time={messInfo.timings.breakfast} items={dailyMenu.breakfast} type="breakfast" />
                <MealCard title="Lunch" time={messInfo.timings.lunch} items={dailyMenu.lunch} type="lunch" />
                <MealCard title="Dinner" time={messInfo.timings.dinner} items={dailyMenu.dinner} type="dinner" />
              </>
            ) : null}
          </div>
        </div>

        {/* Festival Menu */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-secondary" />
            <h2 className="text-xl font-bold text-foreground">Festival Special Menu</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {isLoading ? (
              <>{[1, 2, 3].map((i) => <MealCardSkeleton key={i} />)}</>
            ) : festivalMenu && messInfo ? (
              <>
                <MealCard title="Breakfast" time={messInfo.timings.breakfast} items={festivalMenu.breakfast} type="breakfast" />
                <MealCard title="Lunch" time={messInfo.timings.lunch} items={festivalMenu.lunch} type="lunch" />
                <MealCard title="Dinner" time={messInfo.timings.dinner} items={festivalMenu.dinner} type="dinner" />
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentHomeBefore;
