import type { MappingSet } from "$lib/types/mapping";

export function parseMappingSetJson(text: string): MappingSet {
    return JSON.parse(text) as MappingSet;
}
