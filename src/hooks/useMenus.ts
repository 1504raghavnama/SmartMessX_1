import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { MealMenu, MenuItem } from "@/types/database";

async function fetchMenuByType(
  table: "daily_menus" | "festival_menus",
  menuDate?: string
): Promise<MealMenu> {
  let query = supabase
    .from(table)
    .select("meal_type, menu_items(name, description, is_veg)");

  if (table === "daily_menus" && menuDate) {
    query = query.eq("menu_date", menuDate);
  }

  const { data, error } = await query;
  if (error) throw error;

  const menu: MealMenu = { breakfast: [], lunch: [], dinner: [] };

  if (data) {
    for (const row of data as any[]) {
      const item: MenuItem = {
        name: row.menu_items.name,
        description: row.menu_items.description,
        isVeg: row.menu_items.is_veg,
      };
      const mealType = row.meal_type as keyof MealMenu;
      if (menu[mealType]) {
        menu[mealType].push(item);
      }
    }
  }

  return menu;
}

// Fetch all available menu items
async function fetchAllMenuItems() {
  const { data, error } = await supabase
    .from("menu_items")
    .select("id, name, description, is_veg")
    .order("name");
  if (error) throw error;
  return data || [];
}

export function useDailyMenu(date?: string) {
  const menuDate = date || new Date().toISOString().split("T")[0];
  return useQuery<MealMenu>({
    queryKey: ["dailyMenu", menuDate],
    queryFn: () => fetchMenuByType("daily_menus", menuDate),
  });
}

export function useFestivalMenu() {
  return useQuery<MealMenu>({
    queryKey: ["festivalMenu"],
    queryFn: () => fetchMenuByType("festival_menus"),
  });
}

/** Fetch all available menu items for dropdown selection */
export function useAllMenuItems() {
  return useQuery<any[]>({
    queryKey: ["menuItems"],
    queryFn: () => fetchAllMenuItems(),
  });
}

/** Save menu items to daily_menus table */
export function useSaveMenu(date: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (menuData: {
      breakfast: string[];
      lunch: string[];
      dinner: string[];
    }) => {
      // Delete old menu entries for this date
      const { error: deleteError } = await (supabase
        .from("daily_menus") as any)
        .delete()
        .eq("menu_date", date);
      if (deleteError) throw deleteError;

      // Prepare new menu entries
      const newEntries: any[] = [];
      
      Object.entries(menuData).forEach(([mealType, itemIds]) => {
        (itemIds as string[]).forEach((itemId) => {
          newEntries.push({
            menu_date: date,
            meal_type: mealType,
            menu_item_id: itemId,
          });
        });
      });

      // Insert new entries
      if (newEntries.length > 0) {
        const { error: insertError } = await (supabase
          .from("daily_menus") as any)
          .insert(newEntries);
        if (insertError) throw insertError;
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dailyMenu", date] });
    },
  });
}
