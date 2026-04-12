import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

/** Student check-in: upsert today's attendance record for a specific meal */
export function useCheckin() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (mealType: "breakfast" | "lunch" | "dinner") => {
      if (!user) throw new Error("Not logged in");
      const today = new Date().toISOString().split("T")[0];

      // Check if record exists for today
      const { data: existing } = await supabase
        .from("attendance")
        .select("id")
        .eq("student_id", user.id)
        .eq("date", today)
        .maybeSingle();

      if (existing) {
        // Update existing record
        const { error } = await supabase
          .from("attendance")
          .update({ [mealType]: true, status: "present" })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        // Insert new record
        const record: any = {
          student_id: user.id,
          date: today,
          breakfast: false,
          lunch: false,
          dinner: false,
          status: "present",
        };
        record[mealType] = true;

        const { error } = await supabase.from("attendance").insert(record);
        if (error) throw error;
      }

      return { date: today, mealType };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studentAttendance"] });
      queryClient.invalidateQueries({ queryKey: ["allAttendanceToday"] });
    },
  });
}

/** Owner manual attendance marking */
export function useManualCheckIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      studentId,
      mealType,
    }: {
      studentId: string;
      mealType: "breakfast" | "lunch" | "dinner";
    }) => {
      const today = new Date().toISOString().split("T")[0];

      // Check if student exists
      const { data: student, error: studentError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", studentId)
        .maybeSingle();
      if (studentError) throw studentError;
      if (!student) throw new Error("Student not found");

      // Check if attendance record exists for today
      const { data: existing } = await supabase
        .from("attendance")
        .select("id")
        .eq("student_id", studentId)
        .eq("date", today)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("attendance")
          .update({ [mealType]: true, status: "present" })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const record: any = {
          student_id: studentId,
          date: today,
          breakfast: false,
          lunch: false,
          dinner: false,
          status: "present",
        };
        record[mealType] = true;
        const { error } = await supabase.from("attendance").insert(record);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allAttendanceToday"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}
