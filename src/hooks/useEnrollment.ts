import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

export function useEnrollment() {
  const { user, enroll: markEnrolled } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      planId,
      paymentMethod,
    }: {
      planId: string;
      paymentMethod: string;
    }) => {
      if (!user) throw new Error("Not logged in");

      // Fetch the plan details
      const { data: plan, error: planError } = await supabase
        .from("plans")
        .select("*")
        .eq("id", planId)
        .single();
      if (planError) throw planError;

      const startDate = new Date().toISOString().split("T")[0];
      const endDate = new Date(Date.now() + plan.days * 86400000).toISOString().split("T")[0];

      // Create enrollment
      const { error: enrollError } = await supabase.from("enrollments").insert({
        student_id: user.id,
        plan_id: planId,
        start_date: startDate,
        end_date: endDate,
        balance: plan.price,
        remaining_days: plan.days,
        total_paid: plan.price,
        payment_method: paymentMethod,
        is_active: true,
      });
      if (enrollError) throw enrollError;

      // Create payment record
      const { error: payError } = await supabase.from("payments").insert({
        student_id: user.id,
        date: startDate,
        amount: plan.price,
        method: paymentMethod,
        status: "paid",
        description: `${plan.name} Plan`,
      });
      if (payError) throw payError;

      // Update profile enrolled status
      await markEnrolled();

      // Update mess_info current_enrolled count
      const { data: messInfo } = await supabase
        .from("mess_info")
        .select("id, current_enrolled")
        .limit(1)
        .single();
      if (messInfo) {
        await supabase
          .from("mess_info")
          .update({ current_enrolled: messInfo.current_enrolled + 1 })
          .eq("id", messInfo.id);
      }

      return plan;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studentEnrollment"] });
      queryClient.invalidateQueries({ queryKey: ["studentPayments"] });
      queryClient.invalidateQueries({ queryKey: ["messInfo"] });
    },
  });
}
