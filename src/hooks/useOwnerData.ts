import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { AttendanceRecord, PaymentRecord, DemandPrediction, StudentWithEnrollment } from "@/types/database";

export function useAllStudents() {
  return useQuery<StudentWithEnrollment[]>({
    queryKey: ["allStudents"],
    queryFn: async () => {
      // Fetch all student profiles
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "student")
        .eq("enrolled", true);
      if (profileError) throw profileError;
      if (!profiles || profiles.length === 0) return [];

      // Fetch active enrollments
      const { data: enrollments, error: enrollError } = await supabase
        .from("enrollments")
        .select("*, plans(name, days)")
        .eq("is_active", true);
      if (enrollError) throw enrollError;

      // Fetch all attendance
      const { data: attendance, error: attError } = await supabase
        .from("attendance")
        .select("*")
        .order("date", { ascending: true });
      if (attError) throw attError;

      // Build student list
      return profiles.map((profile) => {
        const enrollment = enrollments?.find((e: any) => e.student_id === profile.id);
        const studentAttendance = (attendance || []).filter(
          (a: AttendanceRecord) => a.student_id === profile.id
        );

        return {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          plan: (enrollment as any)?.plans?.name || "N/A",
          planDays: (enrollment as any)?.plans?.days || 0,
          remainingDays: enrollment?.remaining_days || 0,
          enrolledDate: enrollment?.start_date || profile.created_at.split("T")[0],
          balance: enrollment?.balance || 0,
          totalPaid: enrollment?.total_paid || 0,
          attendance: studentAttendance,
          avatar: profile.avatar_url,
        };
      });
    },
  });
}

export function useStudentById(studentId: string | undefined) {
  return useQuery<StudentWithEnrollment | null>({
    queryKey: ["student", studentId],
    queryFn: async () => {
      if (!studentId) return null;

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", studentId)
        .single();
      if (profileError) throw profileError;

      const { data: enrollment } = await supabase
        .from("enrollments")
        .select("*, plans(name, days)")
        .eq("student_id", studentId)
        .eq("is_active", true)
        .maybeSingle();

      const { data: attendance } = await supabase
        .from("attendance")
        .select("*")
        .eq("student_id", studentId)
        .order("date", { ascending: true });

      return {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        plan: (enrollment as any)?.plans?.name || "N/A",
        planDays: (enrollment as any)?.plans?.days || 0,
        remainingDays: enrollment?.remaining_days || 0,
        enrolledDate: enrollment?.start_date || profile.created_at.split("T")[0],
        balance: enrollment?.balance || 0,
        totalPaid: enrollment?.total_paid || 0,
        attendance: attendance || [],
        avatar: profile.avatar_url,
      };
    },
    enabled: !!studentId,
  });
}

export function useAllAttendanceToday() {
  const today = new Date().toISOString().split("T")[0];
  return useQuery({
    queryKey: ["allAttendanceToday", today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("attendance")
        .select("*, profiles(name)")
        .eq("date", today);
      if (error) throw error;
      return data || [];
    },
  });
}

export function useAllPayments() {
  return useQuery<PaymentRecord[]>({
    queryKey: ["allPayments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .order("date", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

export function useDemandPredictions() {
  return useQuery<DemandPrediction[]>({
    queryKey: ["demandPredictions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("demand_predictions")
        .select("*");
      if (error) throw error;
      return data || [];
    },
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];

      // Count enrolled students
      const { count: enrolledCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "student")
        .eq("enrolled", true);

      // Today's attendance
      const { data: todayAttendance } = await supabase
        .from("attendance")
        .select("*")
        .eq("date", today);

      const presentToday = todayAttendance?.filter((a) => a.status === "present").length || 0;
      const absentToday = todayAttendance?.filter((a) => a.status === "absent").length || 0;
      const leaveToday = todayAttendance?.filter((a) => a.status === "leave").length || 0;

      const mealsToday = (todayAttendance || []).reduce(
        (sum, a) => sum + (a.breakfast ? 1 : 0) + (a.lunch ? 1 : 0) + (a.dinner ? 1 : 0),
        0
      );

      // Total revenue
      const { data: payments } = await supabase
        .from("payments")
        .select("amount")
        .eq("status", "paid");
      const totalRevenue = (payments || []).reduce((sum, p) => sum + p.amount, 0);

      // Attendance rate
      const totalRecords = todayAttendance?.length || 0;
      const attendanceRate = totalRecords > 0
        ? Math.round((presentToday / totalRecords) * 100)
        : 0;

      // Mess info
      const { data: messInfo } = await supabase
        .from("mess_info")
        .select("capacity, current_enrolled")
        .limit(1)
        .single();

      return {
        enrolledCount: enrolledCount || 0,
        presentToday,
        absentToday,
        leaveToday,
        mealsToday,
        totalRevenue,
        attendanceRate,
        capacity: messInfo?.capacity || 200,
        currentEnrolled: messInfo?.current_enrolled || 0,
      };
    },
  });
}
