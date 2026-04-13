import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { AttendanceRecord, PaymentRecord, DemandPrediction, StudentWithEnrollment } from "@/types/database";

/** Lightweight: Just enrolled students (no attendance data) — for dropdowns */
export function useEnrolledStudents() {
  return useQuery<Array<{ id: string; name: string; email: string }>>({
    queryKey: ["enrolledStudents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, email")
        .eq("role", "student")
        .eq("enrolled", true);
      if (error) throw error;
      return data || [];
    },
  });
}

export function useAllStudents() {
  return useQuery<StudentWithEnrollment[]>({
    queryKey: ["allStudents"],
    queryFn: async () => {
      try {
        console.debug("[useAllStudents] Query function executing");
        // Fetch all student profiles
        const { data: profiles, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("role", "student")
          .eq("enrolled", true);
        if (profileError) {
          console.error("[useAllStudents] Profile fetch error:", profileError);
          throw profileError;
        }
        if (!profiles || profiles.length === 0) {
          console.debug("[useAllStudents] No enrolled student profiles found");
          return [];
        }

        // Fetch active enrollments
        const { data: enrollments, error: enrollError } = await supabase
          .from("enrollments")
          .select("*, plans(name, days)")
          .eq("is_active", true);
        if (enrollError) {
          console.error("[useAllStudents] Enrollment fetch error:", enrollError);
          throw enrollError;
        }

        // Fetch all attendance
        const { data: attendance, error: attError } = await supabase
          .from("attendance")
          .select("*")
          .order("date", { ascending: true });
        if (attError) {
          console.error("[useAllStudents] Attendance fetch error:", attError);
          throw attError;
        }

        // Build student list
        const result = profiles.map((profile) => {
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

        console.debug(`[useAllStudents] Built student list with ${result.length} students`);
        return result;
      } catch (err) {
        console.error("[useAllStudents] Exception:", err);
        throw err;
      }
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

export function useStudentById(studentId: string | undefined) {
  return useQuery<StudentWithEnrollment | null>({
    queryKey: ["student", studentId],
    queryFn: async () => {
      if (!studentId) {
        console.warn("[useStudentById] No studentId provided");
        return null;
      }

      console.debug(`[useStudentById] Fetching student ${studentId}`);
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", studentId)
        .single();
      if (profileError) {
        console.error("[useStudentById] Profile fetch error:", profileError);
        throw profileError;
      }

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

      console.debug(`[useStudentById] Fetched student ${studentId} with ${(attendance || []).length} attendance records`);
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
    refetchOnMount: true,
  });
}

export function useAllAttendanceToday() {
  const today = new Date().toISOString().split("T")[0];
  console.debug(`[useAllAttendanceToday] Fetching attendance for ${today}`);
  
  return useQuery({
    queryKey: ["allAttendanceToday", today],
    queryFn: async () => {
      console.debug(`[useAllAttendanceToday] Query function executing for ${today}`);
      const { data, error } = await supabase
        .from("attendance")
        .select("*, profiles(name)")
        .eq("date", today);
      if (error) {
        console.error("[useAllAttendanceToday] Query error:", error);
        throw error;
      }
      const result = data || [];
      console.debug(`[useAllAttendanceToday] Fetched ${result.length} attendance records for ${today}`);
      return result;
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
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
      try {
        const today = new Date().toISOString().split("T")[0];

        // Count enrolled students
        const { count: enrolledCount, error: countError } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("role", "student")
          .eq("enrolled", true);
        if (countError) {
          console.error("[useDashboardStats] Enrolled count error:", countError);
          throw countError;
        }

        // Today's attendance
        const { data: todayAttendance, error: attError } = await supabase
          .from("attendance")
          .select("*")
          .eq("date", today);
        if (attError) {
          console.error("[useDashboardStats] Attendance error:", attError);
          throw attError;
        }

        const presentToday = todayAttendance?.filter((a) => a.status === "present").length || 0;
        const absentToday = todayAttendance?.filter((a) => a.status === "absent").length || 0;
        const leaveToday = todayAttendance?.filter((a) => a.status === "leave").length || 0;

        const mealsToday = (todayAttendance || []).reduce(
          (sum, a) => sum + (a.breakfast ? 1 : 0) + (a.lunch ? 1 : 0) + (a.dinner ? 1 : 0),
          0
        );

        // Total revenue
        const { data: payments, error: paymentError } = await supabase
          .from("payments")
          .select("amount")
          .eq("status", "paid");
        if (paymentError) {
          console.error("[useDashboardStats] Payment error:", paymentError);
          throw paymentError;
        }
        const totalRevenue = (payments || []).reduce((sum, p) => sum + p.amount, 0);

        // Attendance rate
        const totalRecords = todayAttendance?.length || 0;
        const attendanceRate = totalRecords > 0
          ? Math.round((presentToday / totalRecords) * 100)
          : 0;

        // Mess info
        const { data: messInfo, error: messError } = await supabase
          .from("mess_info")
          .select("capacity, current_enrolled")
          .limit(1)
          .single();
        if (messError && messError.code !== "PGRST116") { // PGRST116 = no rows, which is OK
          console.error("[useDashboardStats] Mess info error:", messError);
          // Don't throw, use defaults
        }

        const result = {
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

        console.debug("[useDashboardStats] Stats computed:", result);
        return result;
      } catch (err) {
        console.error("[useDashboardStats] Exception:", err);
        throw err;
      }
    },
  });
}
