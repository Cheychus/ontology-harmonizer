import { describe, expect, it } from "vitest";
import { parseSSSOMString } from "sssom-js";
import fixture from "./fixtures/metadata-import.sssom.tsv?raw";
import { mappingStore } from "$lib/stores/mapping/MappingStore.svelte";
import type { ParsedSssomDocument } from "$lib/types/mapping";

describe("SSSOM mapping-set metadata import", () => {
    it("loads supported header metadata into the editable mapping-set state", async () => {
        const parsed = (await parseSSSOMString(fixture.trimEnd())) as ParsedSssomDocument;

        mappingStore.loadSssom(parsed);

        expect(mappingStore.mappingSet.metadata.title).toBe("Imported mapping set");
        expect(mappingStore.mappingSet.metadata.mappingSetId).toBe("https://example.org/mapping-set.sssom.tsv");
        expect(mappingStore.mappingSet.metadata.license).toBe("https://creativecommons.org/licenses/by/4.0/");
        expect(mappingStore.subjectIdentifier).toEqual({ prefix: "", uri: "" });
    });

    it("retains unknown parsed header fields for a future merge", async () => {
        const parsed = (await parseSSSOMString(fixture.trimEnd())) as ParsedSssomDocument;

        mappingStore.loadSssom(parsed);

        expect(mappingStore.importedSssom?.future_product_field).toBe("retain-this-value");
    });


});
