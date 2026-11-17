import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mappingStore } from "$lib/stores/mapping/MappingStore.svelte";

const baseIri = "https://example.org/terms/";

beforeEach(() => mappingStore.createMappingSet());
afterEach(() => mappingStore.reset());

describe("ARC term source", () => {
    it("reuses an existing CURIE entry and selects it for new mappings", () => {
        mappingStore.addCurieMapEntry("EDAL", baseIri);
        expect(mappingStore.setArcTermSource(" EDAL ", ` ${baseIri} `)).toBeNull();
        expect(mappingStore.subjectIdentifier).toEqual({ prefix: "EDAL", uri: baseIri });
        expect(mappingStore.mappingSet.metadata.curieMap.filter((entry) => entry.prefix === "EDAL")).toHaveLength(1);
    });

    it("rejects invalid input and conflicting definitions without changing the source", () => {
        mappingStore.setArcTermSource("EDAL", baseIri);
        expect(mappingStore.setArcTermSource("   ", baseIri)).not.toBeNull();
        expect(mappingStore.setArcTermSource("OTHER", "https://")).not.toBeNull();
        expect(mappingStore.setArcTermSource("OTHER", "ftp://example.org/")).not.toBeNull();
        expect(mappingStore.setArcTermSource("EDAL", "https://example.org/other/")).not.toBeNull();
        expect(mappingStore.arcSourcePrefix).toBe("EDAL");
        expect(mappingStore.subjectIdentifier.uri).toBe(baseIri);
    });

    it("preserves the source when its last mapping is deleted after choosing another subject prefix", () => {
        mappingStore.setArcTermSource("EDAL", baseIri);
        mappingStore.subjectPrefix = "skos";
        mappingStore.addSssomMapping({
            subjectId: "EDAL:leaf", objectId: "GO:0048366",
            predicateId: "skos:exactMatch", mappingJustification: "semapv:ManualMappingCuration",
        });
        mappingStore.addCurieMapEntry("GO", "http://purl.obolibrary.org/obo/GO_");
        mappingStore.removeSssomMapping(mappingStore.mappingSet.mappings[0]);
        expect(mappingStore.mappingSet.metadata.curieMap.some((entry) => entry.prefix === "EDAL")).toBe(true);
        expect(mappingStore.mappingSet.metadata.curieMap.some((entry) => entry.prefix === "GO")).toBe(false);
    });

    it("clears the default without deleting its CURIE entry or another subject selection", () => {
        mappingStore.setArcTermSource("EDAL", baseIri);
        mappingStore.clearArcTermSource();
        expect(mappingStore.subjectPrefix).toBe("");
        expect(mappingStore.arcSourcePrefix).toBe("");
        expect(mappingStore.mappingSet.metadata.curieMap.some((entry) => entry.prefix === "EDAL")).toBe(true);
        mappingStore.setArcTermSource("EDAL", baseIri);
        mappingStore.subjectPrefix = "skos";
        mappingStore.clearArcTermSource();
        expect(mappingStore.subjectPrefix).toBe("skos");
    });

    it("clears the source when its entry is removed or a new mapping set is loaded", () => {
        mappingStore.setArcTermSource("EDAL", baseIri);
        const index = mappingStore.mappingSet.metadata.curieMap.findIndex((entry) => entry.prefix === "EDAL");
        mappingStore.removeCurieMapEntry(index);
        expect(mappingStore.arcSourcePrefix).toBe("");
        expect(mappingStore.subjectPrefix).toBe("");
        mappingStore.setArcTermSource("EDAL", baseIri);
        mappingStore.createMappingSet();
        expect(mappingStore.arcSourcePrefix).toBe("");
        expect(mappingStore.subjectPrefix).toBe("");
    });
});
