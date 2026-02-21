const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Flexible payload: Lag_1 and Lag_2 are always included; any number of
// one-hot encoded District_* / Month_* keys may also be present.
export type PredictPayload = Record<string, number>;

export interface PredictResponse {
  prediction: number;
  risk_probability: number;
  error?: string;
}

export interface FeatureImportance {
  feature: string;
  value: number;
}

export interface ExplainResponse {
  importances: FeatureImportance[];
  error?: string;
}

export async function explainRisk(payload: PredictPayload): Promise<ExplainResponse> {
  const res = await fetch(`${API_URL}/explain`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Explain server responded with ${res.status}`);
  }

  const data: ExplainResponse = await res.json();

  if (data.error) {
    throw new Error(data.error);
  }

  return data;
}

export async function predictRisk(payload: PredictPayload): Promise<PredictResponse> {
  const res = await fetch(`${API_URL}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Server responded with ${res.status}`);
  }

  const data: PredictResponse = await res.json();

  if (data.error) {
    throw new Error(data.error);
  }

  return data;
}
