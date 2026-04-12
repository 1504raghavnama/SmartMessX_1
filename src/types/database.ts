// ============================================================
// Supabase Database Types for SmartMessX
// ============================================================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at'>;
        Update: Partial<Omit<Profile, 'id'>>;
      };
      plans: {
        Row: Plan;
        Insert: Omit<Plan, 'id' | 'created_at'>;
        Update: Partial<Omit<Plan, 'id'>>;
      };
      mess_info: {
        Row: MessInfo;
        Insert: Omit<MessInfo, 'id' | 'created_at'>;
        Update: Partial<Omit<MessInfo, 'id'>>;
      };
      menu_items: {
        Row: DbMenuItem;
        Insert: Omit<DbMenuItem, 'id' | 'created_at'>;
        Update: Partial<Omit<DbMenuItem, 'id'>>;
      };
      daily_menus: {
        Row: DailyMenu;
        Insert: Omit<DailyMenu, 'id'>;
        Update: Partial<Omit<DailyMenu, 'id'>>;
      };
      festival_menus: {
        Row: FestivalMenu;
        Insert: Omit<FestivalMenu, 'id'>;
        Update: Partial<Omit<FestivalMenu, 'id'>>;
      };
      enrollments: {
        Row: Enrollment;
        Insert: Omit<Enrollment, 'id' | 'created_at'>;
        Update: Partial<Omit<Enrollment, 'id'>>;
      };
      attendance: {
        Row: AttendanceRecord;
        Insert: Omit<AttendanceRecord, 'id' | 'created_at'>;
        Update: Partial<Omit<AttendanceRecord, 'id'>>;
      };
      payments: {
        Row: PaymentRecord;
        Insert: Omit<PaymentRecord, 'id' | 'created_at'>;
        Update: Partial<Omit<PaymentRecord, 'id'>>;
      };
      demand_predictions: {
        Row: DemandPrediction;
        Insert: Omit<DemandPrediction, 'id'>;
        Update: Partial<Omit<DemandPrediction, 'id'>>;
      };
      offers: {
        Row: Offer;
        Insert: Omit<Offer, 'id' | 'created_at'>;
        Update: Partial<Omit<Offer, 'id'>>;
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}

// ============================================================
// Table Row Types
// ============================================================

export interface Profile {
  id: string; // UUID, matches auth.users.id
  email: string;
  name: string;
  phone: string;
  role: 'student' | 'owner';
  enrolled: boolean;
  avatar_url?: string | null;
  created_at: string;
}

export interface Plan {
  id: string;
  slug: string;
  name: string;
  days: number;
  price: number;
  per_day: number;
  created_at: string;
}

export interface MessInfo {
  id: string;
  name: string;
  description: string;
  address: string;
  timing_breakfast: string;
  timing_lunch: string;
  timing_dinner: string;
  contact: string;
  capacity: number;
  current_enrolled: number;
  festival_mode: boolean;
  created_at: string;
}

export interface DbMenuItem {
  id: string;
  name: string;
  description: string | null;
  is_veg: boolean;
  created_at: string;
}

export interface DailyMenu {
  id: string;
  menu_date: string; // DATE
  meal_type: 'breakfast' | 'lunch' | 'dinner';
  menu_item_id: string;
}

export interface FestivalMenu {
  id: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner';
  menu_item_id: string;
}

export interface Enrollment {
  id: string;
  student_id: string;
  plan_id: string;
  start_date: string;
  end_date: string;
  balance: number;
  remaining_days: number;
  total_paid: number;
  payment_method: string;
  is_active: boolean;
  created_at: string;
}

export interface AttendanceRecord {
  id: string;
  student_id: string;
  date: string;
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
  status: 'present' | 'absent' | 'leave';
  created_at: string;
}

export interface PaymentRecord {
  id: string;
  student_id: string;
  date: string;
  amount: number;
  method: string;
  status: 'paid' | 'pending' | 'failed';
  description: string;
  created_at: string;
}

export interface DemandPrediction {
  id: string;
  day: string;
  expected: number;
  actual: number;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  active: boolean;
  valid_till: string;
  created_at: string;
}

// ============================================================
// Frontend-friendly derived types (for components)
// ============================================================

/** Menu item shape used by MealCard component */
export interface MenuItem {
  name: string;
  description?: string | null;
  isVeg: boolean;
}

/** Structured meal menu for a day */
export interface MealMenu {
  breakfast: MenuItem[];
  lunch: MenuItem[];
  dinner: MenuItem[];
}

/** Formatted mess info for frontend use */
export interface FormattedMessInfo {
  name: string;
  description: string;
  address: string;
  timings: {
    breakfast: string;
    lunch: string;
    dinner: string;
  };
  contact: string;
  capacity: number;
  currentEnrolled: number;
  festivalMode: boolean;
}

/** Student with enrollment info, used by owner pages */
export interface StudentWithEnrollment {
  id: string;
  name: string;
  email: string;
  phone: string;
  plan: string;
  planDays: number;
  remainingDays: number;
  enrolledDate: string;
  balance: number;
  totalPaid: number;
  attendance: AttendanceRecord[];
  avatar?: string | null;
}
