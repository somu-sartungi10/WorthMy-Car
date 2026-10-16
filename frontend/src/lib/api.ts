import type { CarPayload, PredictionExplanation } from "./types";

/**
 * Base URL of the FastAPI backend.
 * Configure with the VITE_API_URL env var (defaults to local uvicorn).
 */
const rawBase = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";
export const API_BASE = rawBase.replace(/\/+$/, "");

export type ApiErrorKind = "connection" | "timeout" | "http" | "unknown";

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;

  constructor(message: string, kind: ApiErrorKind, status?: number) {
    super(message);
    this.name = "ApiError";
    this.kind = kind;
    this.status = status;
  }
}

async function post(path: string, body: CarPayload): Promise<Response> {
  try {
    return await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(90_000),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "TimeoutError") {
      throw new ApiError(
        "The request timed out after 90 seconds. Please try again.",
        "timeout",
      );
    }
    throw new ApiError(
      `Cannot connect to the FastAPI backend at ${API_BASE}. Start it using: uvicorn src.api:app --reload`,
      "connection",
    );
  }
}

export interface PredictionResponse {
  price: number;
  explanation: PredictionExplanation | null;
}

/** POST /predict → predicted resale price in INR plus its explanation. */
export async function predictPrice(car: CarPayload): Promise<PredictionResponse> {
  const response = await post("/predict", car);

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new ApiError(
      `Prediction failed (${response.status})${detail ? `: ${detail.slice(0, 400)}` : ""}`,
      "http",
      response.status,
    );
  }

  const data = (await response.json()) as {
    predicted_price?: number;
    explanation?: PredictionExplanation;
  };
  if (typeof data.predicted_price !== "number") {
    throw new ApiError("Unexpected response from the prediction API.", "unknown");
  }
  return {
    price: data.predicted_price,
    explanation: data.explanation ?? null,
  };
}

/** POST /download-report → PDF blob. */
export async function downloadReport(car: CarPayload): Promise<Blob> {
  const response = await post("/download-report", car);

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new ApiError(
      `Report generation failed (${response.status})${detail ? `: ${detail.slice(0, 400)}` : ""}`,
      "http",
      response.status,
    );
  }
  return response.blob();
}

/** Triggers a browser download for an already-fetched blob. */
export function saveBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4_000);
}
