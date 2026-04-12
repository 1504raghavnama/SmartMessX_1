import { Sun, Cloud, Moon } from "lucide-react";
import type { MenuItem } from "@/types/database";

interface MealCardProps {
  title: string;
  time: string;
  items: MenuItem[];
  type: "breakfast" | "lunch" | "dinner";
}

const icons = { breakfast: Sun, lunch: Cloud, dinner: Moon };
const colors = {
  breakfast: "bg-warning/10 text-warning border-warning/20",
  lunch: "bg-primary/10 text-primary border-primary/20",
  dinner: "bg-info/10 text-info border-info/20",
};

const MealCard = ({ title, time, items, type }: MealCardProps) => {
  const Icon = icons[type];
  return (
    <div className={`rounded-xl border p-5 ${colors[type]}`}>
      <div className="flex items-center gap-3 mb-4">
        <Icon className="w-5 h-5" />
        <div>
          <h3 className="font-semibold text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground">{time}</p>
        </div>
      </div>
      <ul className="space-y-2">
        {items.length === 0 ? (
          <li className="text-sm text-muted-foreground">No items available</li>
        ) : (
          items.map((item) => (
            <li key={item.name} className="flex items-start gap-2">
              <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${item.isVeg ? "bg-primary" : "bg-destructive"}`} />
              <div>
                <p className="text-sm font-medium text-foreground">{item.name}</p>
                {item.description && <p className="text-xs text-muted-foreground">{item.description}</p>}
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default MealCard;
