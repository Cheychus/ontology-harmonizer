import { browser } from "$app/environment";
import { applicationStore } from "$lib/stores/application/ApplicationStore.svelte";

export class ApiError extends Error {
  constructor(public status: number, message = `API error ${status}`) {
    super(message);
    this.name = "ApiError";
  }
}

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface ApiSendParams {
  method: Method;
  path: string;
  data?: unknown;
  signal?: AbortSignal;
}

export async function apiSend<T>(fetch: typeof globalThis.fetch, { method, path, data, signal }: ApiSendParams): Promise<T> {
  const headers: HeadersInit = {};

  const opts: RequestInit = {
    method,
    headers,
    signal,
  };

  if (data) {
    headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(data);
  }

  const res = await fetch(path, opts);

  if (!res.ok) {
    const isDataHubRequest = path.startsWith("/api/gitlab/") || path.startsWith("/api/arcs/");
    if (res.status === 401 && isDataHubRequest) {
      if (browser) applicationStore.expireGitLabSession();
      throw new ApiError(401, "Your DataHUB session has expired. Reconnect to continue.");
    }
    throw new ApiError(res.status);
  }

  const text = await res.text();

  return text ? (JSON.parse(text) as T) : ({} as T);
}

export function apiGet<T>(fetch: typeof globalThis.fetch, path: string, signal?: AbortSignal) {
  return apiSend<T>(fetch, { method: "GET", path, signal });
}
