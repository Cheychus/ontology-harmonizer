import type { ICollection, ITerminologySearchResult } from "$lib/types/terminologyService";

const BASE = "https://terminology.services.base4nfdi.de/api-gateway";

async function apiGet<T>(fetch: typeof globalThis.fetch, path: string, params?: Record<string, string>) {
    const url = new URL(BASE + path);

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

export function getCollections(fetch: typeof globalThis.fetch): Promise<ICollection[]> {
    return apiGet<ICollection[]>(fetch, "/collections/");
}

export function searchTerms(fetch: typeof globalThis.fetch, query: string, collectionId: string) {
    return apiGet<ITerminologySearchResult[]>(fetch, "/search", {
        query,
        collectionId,
        display: "short_form,descriptions,label"
    })
}