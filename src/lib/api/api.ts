export async function apiGet<T>(fetch: typeof globalThis.fetch, path: string, params?: Record<string, string>) {
  const url = new URL(path);

  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.append(k, v));
  }

  console.log(url.toString());
  const res = await fetch(url.toString());

  if (!res.ok) {
    throw new Error(`API Error: ${res.status}`);
  }

  return res.json() as Promise<T>;
}
