import type { ICollection, ITerminologySearchResult } from "$lib/types/terminologyService";

const BASE4NFDI_BASE = "https://terminology.services.base4nfdi.de/api-gateway";
const TIB_BASE = "https://api.terminology.tib.eu/api";

export type TerminologyProviderId = "base4nfdi" | "tib";

export const terminologyProviders: { id: TerminologyProviderId; label: string }[] = [
  { id: "base4nfdi", label: "Base4NFDI Terminology Service" },
  { id: "tib", label: "TIB Terminology Service" },
];

interface TibSearchResult {
  iri: string;
  label: string;
  short_form: string;
  description?: string[];
}

interface TibSearchResponse {
  response: {
    docs: TibSearchResult[];
  };
}

async function apiGet<T>(fetch: typeof globalThis.fetch, base: string, path: string, params?: Record<string, string>, options?: RequestInit) {
  const url = new URL(base + path);

  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.append(k, v));
  }

  const res = await fetch(url.toString(), options);

  if (!res.ok) {
    throw new Error(`API Error: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export function getCollections(fetch: typeof globalThis.fetch): Promise<ICollection[]> {
  return apiGet<ICollection[]>(fetch, BASE4NFDI_BASE, "/collections/");
}

export async function searchTerms(
  fetch: typeof globalThis.fetch,
  provider: TerminologyProviderId,
  query: string,
  collectionId: string,
  signal?: AbortSignal
): Promise<ITerminologySearchResult[]> {
  if (provider === "tib") {
    const data = await apiGet<TibSearchResponse>(fetch, TIB_BASE, "/search", { q: query }, { signal });

    return data.response.docs.map((term) => ({
      iri: term.iri,
      label: term.label,
      short_form: term.short_form,
      descriptions: term.description ?? [],
    }));
  }

  return apiGet<ITerminologySearchResult[]>(fetch, BASE4NFDI_BASE, "/search", {
    query,
    collectionId,
    display: "iri,short_form,descriptions,label",
  }, { signal });
}
