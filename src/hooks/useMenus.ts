import { useQuery } from "@tanstack/react-query";
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
