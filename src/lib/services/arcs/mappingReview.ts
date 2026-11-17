import type { DerivedOntology, IChangedOntology } from "$lib/stores/arcs/ArcStore.svelte";
import type { MappingSet } from "$lib/types/mapping";
import { curieToIri } from "$lib/services/sssom/curieMap";

export interface MappingReviewRow {
    field: string;
    currentValues: string[];
    targetValue: string | null;
    occurrences: number;
    pending: number;
    applied: number;
}

export function resolveArcMapping(ontology: DerivedOntology, mappingSet: MappingSet) {
    const mapping = mappingSet.mappings.find((mapping) => mapping.subjectLabel === ontology.key);
    if (!mapping) return null;
    const targetValue = curieToIri(mapping.objectId, mappingSet.metadata.curieMap);
    return {
        targetValue,
        needsUpdate: curieToIri(ontology.value, mappingSet.metadata.curieMap) !== targetValue,
    };
}

export function createMappingReview(
    ontologies: DerivedOntology[],
    mappingSet: MappingSet,
    appliedChanges: IChangedOntology[] = [],
): MappingReviewRow[] {
    const groups = new Map<string, MappingReviewRow>();
    for (const ontology of ontologies) {
        const mapping = resolveArcMapping(ontology, mappingSet);
        const applied = appliedChanges.find((change) =>
            change.old.source === ontology.source && change.old.ontologyAttribute === ontology.ontologyAttribute);
        const originalValue = applied ? applied.old.value : ontology.value;
        let row = groups.get(ontology.key);
        if (!row) {
            row = { field: ontology.key, currentValues: [], targetValue: mapping?.targetValue ?? applied?.new ?? null, occurrences: 0, pending: 0, applied: 0 };
            groups.set(ontology.key, row);
        }
        if (!row.currentValues.includes(originalValue)) row.currentValues.push(originalValue);
        if (row.targetValue === null && applied) row.targetValue = applied.new;
        row.occurrences++;
        if (mapping?.needsUpdate) row.pending++;
        if (applied) row.applied++;
    }
    return [...groups.values()];
}
