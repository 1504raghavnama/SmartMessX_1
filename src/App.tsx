import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import LoginPage from "@/pages/LoginPage";
import DashboardLayout from "@/components/DashboardLayout";
import StudentHomeBefore from "@/pages/student/StudentHomeBefore";
import EnrollmentPage from "@/pages/student/EnrollmentPage";
import StudentDashboard from "@/pages/student/StudentDashboard";
import StudentAttendance from "@/pages/student/StudentAttendance";
import StudentPayments from "@/pages/student/StudentPayments";
import StudentCheckin from "@/pages/student/StudentCheckin";
import OwnerDashboard from "@/pages/owner/OwnerDashboard";
import OwnerAttendance from "@/pages/owner/OwnerAttendance";
import OwnerPredictions from "@/pages/owner/OwnerPredictions";
import OwnerStudents from "@/pages/owner/OwnerStudents";
import StudentProfilePage from "@/pages/owner/StudentProfilePage";
import OwnerReports from "@/pages/owner/OwnerReports";
import OwnerFestival from "@/pages/owner/OwnerFestival";
import OwnerOffers from "@/pages/owner/OwnerOffers";
import NotFound from "@/pages/NotFound";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes
      retry: 1,
    },
  },
});

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
      <p className="text-muted-foreground text-sm">Loading SmartMessX...</p>
    </div>
  </div>
);

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<LoginPage />} />
      </Routes>
    );
  }

  if (user.role === "student" && !user.enrolled) {
    return (
      <Routes>
        <Route path="/student/enroll" element={<EnrollmentPage />} />
        <Route path="*" element={<StudentHomeBefore />} />
      </Routes>
    );
  }

  if (user.role === "student") {
    return (
      <DashboardLayout>
        <Routes>
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/student/attendance" element={<StudentAttendance />} />
          <Route path="/student/payments" element={<StudentPayments />} />
          <Route path="/student/checkin" element={<StudentCheckin />} />
          <Route path="/" element={<Navigate to="/student" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </DashboardLayout>
    );
  }

  // Owner
  return (
    <DashboardLayout>
      <Routes>
        <Route path="/owner" element={<OwnerDashboard />} />
        <Route path="/owner/attendance" element={<OwnerAttendance />} />
        <Route path="/owner/predictions" element={<OwnerPredictions />} />
        <Route path="/owner/students" element={<OwnerStudents />} />
        <Route path="/owner/students/:id" element={<StudentProfilePage />} />
        <Route path="/owner/reports" element={<OwnerReports />} />
        <Route path="/owner/festival" element={<OwnerFestival />} />
        <Route path="/owner/offers" element={<OwnerOffers />} />
        <Route path="/" element={<Navigate to="/owner" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </DashboardLayout>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
