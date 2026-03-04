export interface KarmaTransaction {
  id: string;
  timestamp: string;
  type: "earned" | "spent" | "refund";
  description: string;
  amount: number;
  related_field?: string;
  previous_value?: any;
  undone?: boolean;
}
