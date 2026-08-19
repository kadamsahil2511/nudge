export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];
type Table<Row, Insert = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Partial<Insert>;
  Relationships: [];
};
export interface Database {
  public: {
    Tables: {
      users: Table<{ id: string; email: string; created_at: string }>;
      monthly_budgets: Table<{
        id: string;
        user_id: string;
        month: string;
        funds_minor: number;
        savings_minor: number;
      }>;
      budget_allocations: Table<{
        id: string;
        budget_id: string;
        date: string;
        amount_minor: number;
        category: string;
        description: string;
        kind: string;
        note: string | null;
        recurring_rule_id: string | null;
        generated_for: string | null;
      }>;
      actual_expenses: Table<{
        id: string;
        budget_id: string;
        allocation_id: string | null;
        date: string;
        amount_minor: number;
        note: string | null;
      }>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
