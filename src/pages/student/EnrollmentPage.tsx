import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { usePlans } from "@/hooks/usePlans";
import { useEnrollment } from "@/hooks/useEnrollment";
import { Button } from "@/components/ui/button";
import { Check, CreditCard, Banknote, Smartphone, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { PageSkeleton, ErrorDisplay } from "@/components/LoadingSkeleton";

const EnrollmentPage = () => {
  const { enroll } = useAuth();
  const navigate = useNavigate();
  const { data: plans, isLoading, error } = usePlans();
  const enrollMutation = useEnrollment();
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [paymentMode, setPaymentMode] = useState("upi");

  // Auto-select monthly plan when plans load
  if (plans && plans.length > 0 && !selectedPlanId) {
    const monthlyPlan = plans.find((p) => p.slug === "monthly") || plans[0];
    setSelectedPlanId(monthlyPlan.id);
  }

  if (isLoading) return <PageSkeleton />;
  if (error) return <ErrorDisplay message="Failed to load plans" onRetry={() => window.location.reload()} />;
  if (!plans || plans.length === 0) return <ErrorDisplay message="No plans available" />;

  const selectedPlan = plans.find((p) => p.id === selectedPlanId) || plans[0];

  const handleEnroll = async () => {
    try {
      await enrollMutation.mutateAsync({
        planId: selectedPlan.id,
        paymentMethod: paymentMode,
      });
      toast.success("Enrollment successful! Welcome to SmartMessX.");
      navigate("/student");
    } catch (err: any) {
      toast.error(err.message || "Enrollment failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
        <h1 className="text-2xl font-bold text-foreground text-center mb-2">Choose Your Plan</h1>
        <p className="text-muted-foreground text-center text-sm mb-8">Select a meal plan and payment method</p>

        {/* Plans */}
        <div className="space-y-3 mb-8">
          {plans.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPlanId(p.id)}
              className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all bg-card ${
                selectedPlanId === p.id ? "border-primary" : "border-border hover:border-primary/30"
              }`}
            >
              <div className="text-left">
                <p className="font-semibold text-foreground">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.days} days · ₹{p.perDay}/day</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-foreground">₹{p.price.toLocaleString()}</span>
                {selectedPlanId === p.id && (
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-primary-foreground" />
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Payment Mode */}
        <h3 className="text-sm font-semibold text-foreground mb-3">Payment Method</h3>
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { id: "upi", icon: Smartphone, label: "UPI" },
            { id: "card", icon: CreditCard, label: "Card" },
            { id: "cash", icon: Banknote, label: "Cash" },
          ].map((pm) => (
            <button
              key={pm.id}
              onClick={() => setPaymentMode(pm.id)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                paymentMode === pm.id ? "border-primary bg-accent" : "border-border hover:border-primary/30"
              }`}
            >
              <pm.icon className="w-5 h-5 text-foreground" />
              <span className="text-xs font-medium text-foreground">{pm.label}</span>
            </button>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-card border border-border rounded-xl p-4 mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Plan</span>
            <span className="text-foreground font-medium">{selectedPlan.name} ({selectedPlan.days} days)</span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Payment</span>
            <span className="text-foreground font-medium capitalize">{paymentMode}</span>
          </div>
          <div className="border-t border-border pt-2 mt-2 flex justify-between">
            <span className="font-semibold text-foreground">Total</span>
            <span className="font-bold text-foreground text-lg">₹{selectedPlan.price.toLocaleString()}</span>
          </div>
        </div>

        <Button onClick={handleEnroll} className="w-full h-12 font-semibold text-base" disabled={enrollMutation.isPending}>
          {enrollMutation.isPending ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
          ) : (
            "Confirm & Pay"
          )}
        </Button>
        <Button variant="ghost" onClick={() => navigate(-1)} className="w-full mt-2 text-muted-foreground">
          Go Back
        </Button>
      </motion.div>
    </div>
  );
};

export default EnrollmentPage;
