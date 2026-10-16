export interface CarPayload {
  make: string;
  model: string;
  year: number;
  kilometer: number;
  fuel_type: string;
  transmission: string;
  location: string;
  color: string;
  owner: string;
  seller_type: string;
  engine: string;
  max_power: string;
  max_torque: string;
  drivetrain: string;
  length: number;
  width: number;
  height: number;
  seating_capacity: number;
  fuel_tank_capacity: number;
}

export interface DatasetRow {
  [column: string]: string | number;
}

export interface Meta {
  generatedAt: string;
  metrics: {
    test_metrics: {
      MAE: number;
      RMSE: number;
      R2: number;
    };
    model: {
      algorithm: string;
      hyperparameters: Record<string, number | null>;
    };
  };
  options: Record<string, string[]>;
  modelsByMake: Record<string, string[]>;
  dataset: {
    totalRows: number;
    columns: string[];
    sample: DatasetRow[];
  };
}

export type Verdict = "excellent" | "good" | "fair" | "high";

export interface FeatureContribution {
  feature: string;
  /** Signed effect in INR: estimate = base_value + sum(contributions). */
  contribution: number;
}

export interface PredictionExplanation {
  base_value: number;
  contributions: FeatureContribution[];
}
