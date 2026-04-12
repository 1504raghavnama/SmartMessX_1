import { useDemandPredictions } from "@/hooks/useOwnerData";
import { PageSkeleton, ErrorDisplay } from "@/components/LoadingSkeleton";
import StatCard from "@/components/StatCard";
import { TrendingUp, UtensilsCrossed, Users, AlertTriangle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const OwnerPredictions = () => {
  const { data: predictions, isLoading, error } = useDemandPredictions();

  if (isLoading) return <PageSkeleton />;
  if (error) return <ErrorDisplay message="Failed to load predictions" onRetry={() => window.location.reload()} />;

  const data = predictions || [];
  const avgMeals = data.length > 0
    ? Math.round(data.reduce((s, d) => s + d.actual, 0) / data.length)
    : 0;
  const peakDay = data.reduce((max, d) => (d.actual > (max?.actual || 0) ? d : max), data[0]);
  const lastWeekAvg = data.length > 0
    ? Math.round(data.reduce((s, d) => s + d.expected, 0) / data.length)
    : 0;
  const trend = avgMeals > 0 && lastWeekAvg > 0
    ? ((avgMeals - lastWeekAvg) / lastWeekAvg * 100).toFixed(0)
    : "0";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Food Demand Prediction</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={UtensilsCrossed} label="Avg Daily Meals" value={avgMeals} variant="primary" />
        <StatCard icon={TrendingUp} label="Trend" value={`${Number(trend) >= 0 ? '+' : ''}${trend}%`} subtitle="vs expected" variant="info" />
        <StatCard icon={Users} label="Peak Day" value={peakDay?.day || "N/A"} subtitle={`~${peakDay?.actual || 0} meals`} variant="warning" />
        <StatCard icon={AlertTriangle} label="Waste Risk" value={avgMeals > lastWeekAvg ? "Medium" : "Low"} variant="default" />
      </div>

      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-semibold text-foreground mb-4">Expected vs Actual Meals</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 90%)" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="expected" stroke="hsl(142, 52%, 36%)" strokeWidth={2} dot={{ r: 4 }} name="Expected" />
              <Line type="monotone" dataKey="actual" stroke="hsl(30, 80%, 55%)" strokeWidth={2} dot={{ r: 4 }} name="Actual" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default OwnerPredictions;
