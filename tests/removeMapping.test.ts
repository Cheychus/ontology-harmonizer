import { afterEach, expect, it } from "vitest";
import { arcStore } from "$lib/stores/arcs/ArcStore.svelte";
import { mappingStore } from "$lib/stores/mapping/MappingStore.svelte";
import { createDefaultMappingSet } from "$lib/services/sssom/parseSssomTsvData";

afterEach(() => {
    arcStore.ontologyCandidates.clear();
    mappingStore.reset();
});

it.each([false, true])("returns a removed mapping's term to the workflow (active term: %s)", active => {
    arcStore.ontologyCandidates.set("Organism", {
        key: "Organism", value: "", ontologyAttribute: "propertyID", source: { "@id": "test", "@type": "PropertyValue" },
    });
    const set = createDefaultMappingSet();
    set.mappings.push({
        subjectId: "EX:organism", subjectLabel: "Organism", objectId: "EX:target",
        predicateId: "skos:exactMatch", mappingJustification: "semapv:ManualMappingCuration",
    });
    mappingStore.loadMappingSet(set);
    const current = active ? { key: "Other", value: "", ontologyAttribute: "propertyID" as const, source: { "@id": "other", "@type": "PropertyValue" } } : null;
    mappingStore.current = current;

    mappingStore.removeSssomMapping(mappingStore.mappingSet.mappings[0]);

    expect(mappingStore.mappingSet.mappings).toHaveLength(0);
    if (active) {
        expect(mappingStore.current?.key).toBe("Other");
        expect(mappingStore.queue.map(item => item.key)).toEqual(["Organism"]);
    } else {
        expect(mappingStore.current?.key).toBe("Organism");
        expect(mappingStore.queue).toHaveLength(0);
    }
});
