import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

/** Student check-in: upsert today's attendance record for a specific meal */
export function useCheckin() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (mealType: "breakfast" | "lunch" | "dinner") => {
      if (!user) {
        const msg = "Not logged in";
        console.error("[useCheckin]", msg);
        throw new Error(msg);
      }
      const today = new Date().toISOString().split("T")[0];
      console.debug(`[useCheckin] Checking in for ${mealType} on ${today}`);

      try {
        // Fetch existing record to preserve meal flags
        const { data: existing, error: fetchError } = await supabase
          .from("attendance")
          .select("breakfast, lunch, dinner")
          .eq("student_id", user.id)
          .eq("date", today)
          .maybeSingle() as any;

        if (fetchError) {
          console.error("[useCheckin] Fetch existing record error:", fetchError);
          throw fetchError;
        }

        // Build upsert object, preserving existing meal flags
        const upsertData: any = {
          student_id: user.id,
          date: today,
          breakfast: (existing?.breakfast) || mealType === 'breakfast',
          lunch: (existing?.lunch) || mealType === 'lunch',
          dinner: (existing?.dinner) || mealType === 'dinner',
          status: 'present'
        };

        const { error: upsertError } = await supabase
          .from("attendance")
          .upsert(upsertData, {
            onConflict: 'student_id,date'
          });

        if (upsertError) {
          console.error("[useCheckin] Upsert error:", upsertError);
          throw upsertError;
        }

        console.debug(`[useCheckin] Upserted attendance record with ${mealType}`);
        return { date: today, mealType };
      } catch (err) {
        console.error("[useCheckin] Exception:", err);
        throw err;
      }
    },
    onSuccess: () => {
      console.debug("[useCheckin] Success - invalidating caches");
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      queryClient.invalidateQueries({ queryKey: ["studentAttendance"] });
      queryClient.invalidateQueries({ queryKey: ["allAttendanceToday"] });
      queryClient.invalidateQueries({ queryKey: ["allStudents"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
    onError: (error) => {
      console.error("[useCheckin] Mutation failed:", error);
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
      console.debug(`[useManualCheckIn] Marking attendance for student ${studentId}, meal ${mealType} on ${today}`);

      try {
        // Check if student exists
        const { data: student, error: studentError } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", studentId)
          .maybeSingle();
        if (studentError) {
          console.error("[useManualCheckIn] Student lookup error:", studentError);
          throw studentError;
        }
        if (!student) {
          const msg = "Student not found";
          console.error("[useManualCheckIn]", msg);
          throw new Error(msg);
        }

        // Fetch existing record to preserve meal flags
        const { data: existing, error: fetchError } = await supabase
          .from("attendance")
          .select("breakfast, lunch, dinner")
          .eq("student_id", studentId)
          .eq("date", today)
          .maybeSingle() as any;

        if (fetchError) {
          console.error("[useManualCheckIn] Fetch existing record error:", fetchError);
          throw fetchError;
        }

        // Build upsert object, preserving existing meal flags
        const upsertData: any = {
          student_id: studentId,
          date: today,
          breakfast: (existing?.breakfast) || mealType === 'breakfast',
          lunch: (existing?.lunch) || mealType === 'lunch',
          dinner: (existing?.dinner) || mealType === 'dinner',
          status: 'present'
        };

        const { error: upsertError } = await supabase
          .from("attendance")
          .upsert(upsertData, {
            onConflict: 'student_id,date'
          });

        if (upsertError) {
          console.error("[useManualCheckIn] Upsert error:", upsertError);
          throw upsertError;
        }

        console.debug(`[useManualCheckIn] Upserted attendance record with ${mealType}`);
      } catch (err) {
        console.error("[useManualCheckIn] Exception:", err);
        throw err;
      }
    },
    onSuccess: () => {
      console.debug("[useManualCheckIn] Success - invalidating caches");
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      queryClient.invalidateQueries({ queryKey: ["allAttendanceToday"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      queryClient.invalidateQueries({ queryKey: ["enrolledStudents"] });
      queryClient.invalidateQueries({ queryKey: ["allStudents"] });
      queryClient.invalidateQueries({ queryKey: ["studentAttendance"] });
    },
    onError: (error) => {
      console.error("[useManualCheckIn] Mutation failed:", error);
    },
  });
}
