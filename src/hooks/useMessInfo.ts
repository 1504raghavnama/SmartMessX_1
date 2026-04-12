import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { FormattedMessInfo } from "@/types/database";

export function useMessInfo() {
  return useQuery<FormattedMessInfo>({
    queryKey: ["messInfo"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mess_info")
        .select("*")
        .limit(1)
        .single();
      if (error) throw error;
      return {
        name: data.name,
        description: data.description,
        address: data.address,
        timings: {
          breakfast: data.timing_breakfast,
          lunch: data.timing_lunch,
          dinner: data.timing_dinner,
        },
        contact: data.contact,
        capacity: data.capacity,
        currentEnrolled: data.current_enrolled,
        festivalMode: data.festival_mode,
      };
    },
  });
}

export function useUpdateFestivalMode() {
  const toggleFestivalMode = async (enabled: boolean) => {
    const { data: messInfoRow } = await supabase
      .from("mess_info")
      .select("id")
      .limit(1)
      .single();
    if (!messInfoRow) throw new Error("Mess info not found");

    const { error } = await supabase
      .from("mess_info")
      .update({ festival_mode: enabled })
      .eq("id", messInfoRow.id);
    if (error) throw error;
  };
  return { toggleFestivalMode };
}
