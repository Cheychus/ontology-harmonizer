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
    throw new Error(`API error ${res.status}`);
  }

  const text = await res.text();

  return text ? (JSON.parse(text) as T) : ({} as T);
}

export function apiGet<T>(fetch: typeof globalThis.fetch, path: string, signal?: AbortSignal) {
  return apiSend<T>(fetch, { method: "GET", path, signal });
}
