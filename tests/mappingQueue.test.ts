import { afterEach, describe, expect, it } from "vitest";
import { arcStore } from "$lib/stores/arcs/ArcStore.svelte";
import { mappingStore } from "$lib/stores/mapping/MappingStore.svelte";
import { createDefaultMappingSet } from "$lib/services/sssom/parseSssomTsvData";
import type { SssomMapping } from "$lib/types/mapping";

const barleyMapping: SssomMapping = {
    subjectId: "EX:barley", subjectLabel: "Hordeum vulgare", objectId: "EX:target",
    predicateId: "skos:exactMatch", mappingJustification: "semapv:ManualMappingCuration",
};

function loadArc() {
    arcStore.init({ "@context": [], "@graph": [
        { "@id": "organism", "@type": "PropertyValue", name: "Organism", propertyID: "", value: "Hordeum vulgare", valueReference: "" },
    ] });
}

afterEach(() => {
    arcStore.init({ "@context": [], "@graph": [] });
    arcStore.initialised = false;
    mappingStore.reset();
});

describe("mapping focus and queue", () => {
    it("updates the current store term when selecting from the queue and advances after mapping", () => {
        mappingStore.createMappingSet();
        loadArc();
        expect(mappingStore.current?.key).toBe("Organism");
        expect(mappingStore.queue.map((term) => term.key)).toEqual(["Hordeum vulgare"]);

        mappingStore.selectQueuedOntology(0);
        expect(mappingStore.current?.key).toBe("Hordeum vulgare");
        expect(mappingStore.queue.map((term) => term.key)).toEqual(["Organism"]);
        mappingStore.addSssomMapping(barleyMapping);
        mappingStore.moveNext();

        expect(mappingStore.current?.key).toBe("Organism");
        expect(mappingStore.queue).toEqual([]);
        expect(mappingStore.mappedOntologies.map((term) => term.key)).toEqual(["Hordeum vulgare"]);
    });

    it("does not remove the current term from the derived list of unmapped terms", () => {
        mappingStore.createMappingSet();
        loadArc();
        expect(mappingStore.unmappedOntologies.map((term) => term.key)).toEqual(["Organism", "Hordeum vulgare"]);
        mappingStore.startMapping(mappingStore.unmappedOntologies);
        expect(mappingStore.current?.key).toBe("Organism");
        expect(mappingStore.queue.map((term) => term.key)).toEqual(["Hordeum vulgare"]);
    });

    it.each([true, false])("omits an existing mapping from focus and queue (mapping loaded first: %s)", (mappingFirst) => {
        mappingStore.createMappingSet();
        const set = createDefaultMappingSet();
        set.mappings.push(barleyMapping);
        if (mappingFirst) mappingStore.loadMappingSet(set);
        loadArc();
        if (!mappingFirst) mappingStore.loadMappingSet(set);

        expect(mappingStore.current?.key).toBe("Organism");
        expect(mappingStore.queue).toEqual([]);
        arcStore.setTermFilter("standard");
        arcStore.setTermFilter("all");
        expect(mappingStore.current?.key).toBe("Organism");
        expect(mappingStore.queue).toEqual([]);
        expect(mappingStore.mappedOntologies.map((term) => term.key)).toEqual(["Hordeum vulgare"]);
    });
});
