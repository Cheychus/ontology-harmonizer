type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface ApiSendParams {
  method: Method;
  path: string;
  data?: unknown;
}

export async function apiSend<T>(fetch: typeof globalThis.fetch, { method, path, data }: ApiSendParams): Promise<T> {
  const headers: HeadersInit = {};

  const opts: RequestInit = {
    method,
    headers,
  };

  if (data) {
    headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(data);
  }

  const res = await fetch(path, opts);

  if (!res.ok) {
    throw new Error(`API error ${res.status}`);
  }

  console.log(res);

  const text = await res.text();

  return text ? (JSON.parse(text) as T) : ({} as T);
}

export function apiGet<T>(fetch: typeof globalThis.fetch, path: string) {
  return apiSend<T>(fetch, { method: "GET", path });
}
