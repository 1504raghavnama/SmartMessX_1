import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Plan } from "@/types/database";

export interface FormattedPlan {
  id: string;
  slug: string;
  name: string;
  days: number;
  price: number;
  perDay: number;
}

export function usePlans() {
  return useQuery<FormattedPlan[]>({
    queryKey: ["plans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("plans")
        .select("*")
        .order("days", { ascending: true });
      if (error) throw error;
      return (data || []).map((p: Plan) => ({
        id: p.id,
        slug: (p as any).slug || p.id,
        name: p.name,
        days: p.days,
        price: p.price,
        perDay: p.per_day,
      }));
    },
  });
}
