export interface ReferenceQuality {
  name: string;
  type: "positive" | "negative";
  karma_cost: number;
  effects: string;
  description?: string;
  source?: string;
}
