import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import type { AttendanceRecord, PaymentRecord, Enrollment } from "@/types/database";

export function useStudentEnrollment() {
  const { user } = useAuth();
  return useQuery<Enrollment | null>({
    queryKey: ["studentEnrollment", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("enrollments")
        .select("*")
        .eq("student_id", user.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
    refetchOnMount: true,
  });
}

export function useStudentAttendance() {
  const { user } = useAuth();
  console.debug("[useStudentAttendance] Hook render, user:", user?.id);
  
  return useQuery<AttendanceRecord[]>({
    queryKey: ["studentAttendance", user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.warn("[useStudentAttendance] No user ID, returning empty array");
        return [];
      }
      try {
        console.debug(`[useStudentAttendance] Fetching records for user ${user.id}`);
        const { data, error } = await supabase
          .from("attendance")
          .select("*")
          .eq("student_id", user.id)
          .order("date", { ascending: false });
        
        if (error) {
          console.error("[useStudentAttendance] Query error:", error);
          throw error;
        }
        
        const result = data || [];
        console.debug(`[useStudentAttendance] Fetched ${result.length} attendance records for user ${user.id}`);
        return result;
      } catch (err) {
        console.error("[useStudentAttendance] Exception:", err);
        throw err;
      }
    },
    enabled: !!user?.id,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

export function useStudentPayments() {
  const { user } = useAuth();
  return useQuery<PaymentRecord[]>({
    queryKey: ["studentPayments", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("student_id", user.id)
        .order("date", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
    refetchOnMount: true,
  });
}
