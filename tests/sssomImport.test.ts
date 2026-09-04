import { describe, expect, it } from "vitest";
import { parseSSSOMString } from "sssom-js";
import fixture from "./fixtures/metadata-import.sssom.tsv?raw";
import { mappingStore, type IMapping } from "$lib/stores/mapping/MappingStore.svelte";
import type { ParsedSssomDocument } from "$lib/types/mapping";

describe("SSSOM mapping-set metadata import", () => {
    it("loads supported header metadata into the editable mapping-set state", async () => {
        const parsed = (await parseSSSOMString(fixture.trimEnd())) as ParsedSssomDocument;

        mappingStore.loadSssom(parsed);

        expect(mappingStore.mappingSetMetadata.title).toBe("Imported mapping set");
        expect(mappingStore.mappingSetMetadata.mappingSetId).toBe("https://example.org/mapping-set.sssom.tsv");
        expect(mappingStore.mappingSetMetadata.license).toBe("https://creativecommons.org/licenses/by/4.0/");
    });

    it("retains unknown parsed header fields for a future merge", async () => {
        const parsed = (await parseSSSOMString(fixture.trimEnd())) as ParsedSssomDocument;

        mappingStore.loadSssom(parsed);

        expect(mappingStore.importedSssom?.future_product_field).toBe("retain-this-value");
    });

    it("keeps legacy JSON loading separate from a parsed SSSOM import", () => {
        const legacyMapping: IMapping[] = [{ name: "Organism", iri: "https://example.org/organism", synonyms: [], shortForm: "EX:1" }];

        mappingStore.load(legacyMapping);

        expect(mappingStore.mappingJson).toEqual(legacyMapping);
        expect(mappingStore.importedSssom).toBeNull();
    });
});
