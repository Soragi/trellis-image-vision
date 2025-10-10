export interface NimGenerationRequest {
  images: string[];
  prompt?: string;
  meshFormat?: string;
  textureFormat?: string;
  seed?: number;
  noTexture?: boolean;
  slatCfgScale?: number;
  ssCfgScale?: number;
  slatSamplingSteps?: number;
  ssSamplingSteps?: number;
}

export interface NimAsset {
  id: string;
  type: string;
  url: string;
  sizeMB?: number;
  previewImageUrl?: string;
}

export type NimJobStatus =
  | "queued"
  | "processing"
  | "succeeded"
  | "failed";

export interface NimGenerationResponse {
  jobId: string;
  status: NimJobStatus;
  message?: string;
  assets?: NimAsset[];
  error?: string;
}

const DEFAULT_BACKEND_URL = "http://localhost:3001/api";

const buildHeaders = () => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  // Note: API key is now handled by the backend service
  // The backend will authenticate with Trellis NIM using the configured API key
  return headers;
};

const getBaseUrl = () => {
  const base = import.meta.env.VITE_BACKEND_URL ?? DEFAULT_BACKEND_URL;
  return base.replace(/\/$/, "");
};

export interface SubmitJobOptions {
  signal?: AbortSignal;
}

export const submitGenerationJob = async (
  payload: NimGenerationRequest,
  options: SubmitJobOptions = {}
): Promise<NimGenerationResponse> => {
  const response = await fetch(`${getBaseUrl()}/jobs/base64`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify(payload),
    signal: options.signal,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Backend request failed (${response.status} ${response.statusText}): ${errorText}`
    );
  }

  return (await response.json()) as NimGenerationResponse;
};

export interface PollJobOptions {
  intervalMs?: number;
  maxAttempts?: number;
  signal?: AbortSignal;
  onUpdate?: (update: NimGenerationResponse) => void;
}

export const pollGenerationJob = async (
  jobId: string,
  options: PollJobOptions = {}
): Promise<NimGenerationResponse> => {
  const {
    intervalMs = 3000,
    maxAttempts = 100,
    signal,
    onUpdate,
  } = options;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (signal?.aborted) {
      throw new Error("Polling aborted");
    }

    const response = await fetch(`${getBaseUrl()}/jobs/${jobId}`, {
      headers: buildHeaders(),
      signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to poll job status (${response.status} ${response.statusText}): ${errorText}`
      );
    }

    const data = (await response.json()) as NimGenerationResponse;
    onUpdate?.(data);

    if (data.status === "succeeded" || data.status === "failed") {
      return data;
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error("Timed out while waiting for job to complete");
};
