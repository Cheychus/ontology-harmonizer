import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { arcStore } from "$lib/stores/arcs/ArcStore.svelte";
import { mappingStore } from "$lib/stores/mapping/MappingStore.svelte";
import { createDefaultMappingSet } from "$lib/services/sssom/parseSssomTsvData";
import { createMappingReview } from "$lib/services/arcs/mappingReview";

const base = "https://example.org/terms/";

function loadArc(values: string[]) {
    arcStore.init({
        "@context": [],
        "@graph": values.map((value, index) => ({
            "@id": `field-${index}`, "@type": "PropertyValue", name: "Organism", propertyID: value,
        })),
    });
}

function review() {
    return createMappingReview(arcStore.allOntologyValues, mappingStore.mappingSet, arcStore.changedOntologies);
}

beforeEach(() => {
    const mappingSet = createDefaultMappingSet();
    mappingSet.metadata.curieMap.push({ prefix: "EX", iri: base });
    mappingSet.mappings.push({
        subjectId: "EX:organism", subjectLabel: "Organism", objectId: "EX:target",
        predicateId: "skos:exactMatch", mappingJustification: "semapv:ManualMappingCuration",
    });
    mappingStore.loadMappingSet(mappingSet);
});

afterEach(() => {
    arcStore.init({ "@context": [], "@graph": [] });
    arcStore.initialised = false;
    mappingStore.reset();
});

describe("grouped ARC review and application", () => {
    it("shows twelve occurrences as one row and retains their original values after applying", () => {
        loadArc(Array(12).fill(""));
        expect(review()).toHaveLength(1);
        expect(review()[0]).toMatchObject({ currentValues: [""], occurrences: 12, pending: 12, applied: 0 });

        expect(arcStore.applyMapping()).toBe(12);
        expect(arcStore.json?.["@graph"].every((node) => node.propertyID === base + "target")).toBe(true);
        expect(review()[0]).toMatchObject({ currentValues: [""], occurrences: 12, pending: 0, applied: 12 });
        expect(arcStore.applyMapping()).toBe(0);
        expect(arcStore.changedOntologies).toHaveLength(12);
    });

    it("does not rewrite equivalent CURIEs and IRIs", () => {
        loadArc(["EX:target", base + "target"]);
        expect(review()[0].pending).toBe(0);
        expect(arcStore.applyMapping()).toBe(0);
        expect(arcStore.changedOntologies).toHaveLength(0);
    });

    it("keeps distinct original values within a single field row", () => {
        loadArc([base + "first", base + "second", base + "first"]);
        arcStore.applyMapping();
        expect(review()).toHaveLength(1);
        expect(review()[0]).toMatchObject({ currentValues: [base + "first", base + "second"], occurrences: 3, applied: 3 });
    });

    it("tracks net changes across repeated edits and removes changes reverted to the original value", () => {
        loadArc([base + "original", base + "original"]);
        arcStore.applyMapping();
        arcStore.publishedResult = { commitUrl: "https://example.org/commit", mergeUrl: "https://example.org/mr" };
        mappingStore.mappingSet.mappings[0].objectId = "EX:second";
        expect(arcStore.applyMapping()).toBe(2);
        expect(arcStore.publishedResult).toBeNull();
        expect(arcStore.changedOntologies).toHaveLength(2);
        expect(review()[0].currentValues).toEqual([base + "original"]);

        mappingStore.mappingSet.mappings[0].objectId = "EX:original";
        expect(arcStore.applyMapping()).toBe(2);
        expect(arcStore.changedOntologies).toHaveLength(0);
        expect(review()[0]).toMatchObject({ currentValues: [base + "original"], pending: 0, applied: 0 });
    });

    it("leaves fields without a mapping untouched", () => {
        arcStore.init({ "@context": [], "@graph": [
            { "@id": "organism", "@type": "PropertyValue", name: "Organism", propertyID: "" },
            { "@id": "country", "@type": "PropertyValue", name: "Country", propertyID: "https://example.org/country" },
        ] });
        expect(arcStore.applyMapping()).toBe(1);
        expect(arcStore.json?.["@graph"][1].propertyID).toBe("https://example.org/country");
        expect(review().find((row) => row.field === "Country")).toMatchObject({ targetValue: null, pending: 0, applied: 0 });
    });

    it("counts different ontology attributes on the same node separately", () => {
        arcStore.init({ "@context": [], "@graph": [{
            "@id": "both", "@type": "PropertyValue", name: "Organism", propertyID: "", unitText: "Organism", unitCode: "",
        }] });
        expect(arcStore.applyMapping()).toBe(2);
        expect(review()).toHaveLength(1);
        expect(review()[0]).toMatchObject({ occurrences: 2, applied: 2 });
        expect(arcStore.changedOntologies).toHaveLength(2);
    });

    it("clears review history and publication links when another ARC is loaded", () => {
        loadArc([""]);
        arcStore.applyMapping();
        arcStore.publishedResult = { commitUrl: "https://example.org/commit", mergeUrl: "https://example.org/mr" };
        loadArc([base + "original"]);
        expect(arcStore.changedOntologies).toHaveLength(0);
        expect(arcStore.publishedResult).toBeNull();
        expect(review()[0]).toMatchObject({ currentValues: [base + "original"], applied: 0, pending: 1 });
    });
});
