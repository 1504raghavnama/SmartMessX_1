import { useState } from "react";
import { Button } from "@/components/ui/button";
import { QrCode, Camera, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useCheckin } from "@/hooks/useAttendance";

const StudentCheckin = () => {
  const [scanning, setScanning] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkinInfo, setCheckinInfo] = useState<{ meal: string; time: string } | null>(null);
  const checkinMutation = useCheckin();

  const getCurrentMeal = (): "breakfast" | "lunch" | "dinner" => {
    const hour = new Date().getHours();
    if (hour < 10) return "breakfast";
    if (hour < 15) return "lunch";
    return "dinner";
  };

  const handleScan = () => {
    setScanning(true);
    const meal = getCurrentMeal();

    // Simulate scanning delay, then do real check-in
    setTimeout(async () => {
      try {
        await checkinMutation.mutateAsync(meal);
        setScanning(false);
        setCheckedIn(true);
        const now = new Date();
        setCheckinInfo({
          meal: meal.charAt(0).toUpperCase() + meal.slice(1),
          time: now.toLocaleString("en-IN", {
            month: "long",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
        });
        toast.success("Check-in successful! Enjoy your meal.");
      } catch (err: any) {
        setScanning(false);
        toast.error(err.message || "Check-in failed. Please try again.");
      }
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Digital Check-in</h1>

      <div className="flex flex-col items-center justify-center py-12">
        <AnimatePresence mode="wait">
          {checkedIn ? (
            <motion.div
              key="done"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              <div className="w-24 h-24 rounded-full bg-accent flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-12 h-12 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Checked In!</h2>
              <p className="text-muted-foreground text-sm mt-1">
                {checkinInfo?.meal} · {checkinInfo?.time}
              </p>
              <Button variant="outline" onClick={() => setCheckedIn(false)} className="mt-6">
                Scan Again
              </Button>
            </motion.div>
          ) : scanning ? (
            <motion.div
              key="scanning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <div className="w-64 h-64 rounded-2xl border-2 border-dashed border-primary/50 bg-accent/50 flex items-center justify-center relative overflow-hidden">
                <motion.div
                  className="absolute inset-x-0 h-0.5 bg-primary"
                  animate={{ top: ["10%", "90%", "10%"] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <Camera className="w-12 h-12 text-primary/50" />
              </div>
              <p className="text-muted-foreground text-sm mt-4">Scanning QR code...</p>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <div className="w-32 h-32 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
                <QrCode className="w-16 h-16 text-muted-foreground" />
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-2">Scan QR to Check-in</h2>
              <p className="text-muted-foreground text-sm mb-6 max-w-xs">
                Point your camera at the mess QR code to mark your attendance
              </p>
              <Button onClick={handleScan} className="h-11 px-8 font-semibold">
                <Camera className="w-4 h-4 mr-2" /> Start Scanning
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StudentCheckin;
