import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Offer } from "@/types/database";

export function useOffers() {
  return useQuery<Offer[]>({
    queryKey: ["offers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("offers")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

export function useAddOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (offer: { title: string; description: string; validTill: string }) => {
      const { error } = await supabase.from("offers").insert({
        title: offer.title,
        description: offer.description,
        active: true,
        valid_till: offer.validTill,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offers"] });
    },
  });
}

export function useRemoveOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (offerId: string) => {
      const { error } = await supabase
        .from("offers")
        .delete()
        .eq("id", offerId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offers"] });
    },
  });
}
