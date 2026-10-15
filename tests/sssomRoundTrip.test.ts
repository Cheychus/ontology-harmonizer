import { describe, expect, it } from "vitest";
import { parseSSSOMString } from "sssom-js";
import { serializeSssomTsv } from "$lib/services/sssom/serializeSssomTsv";
import { createDefaultMappingSet, createMappingSetFromSssom } from "$lib/services/sssom/parseSssomTsvData";
import type { MappingSet, ParsedSssomDocument } from "$lib/types/mapping";

function exampleMappingSet(): MappingSet {
    const mappingSet = createDefaultMappingSet();
    mappingSet.metadata = {
        ...mappingSet.metadata,
        mappingSetId: "https://example.org/mappings.sssom.tsv",
        license: "https://creativecommons.org/licenses/by/4.0/",
        title: "Example mapping set",
        description: 'Description with "quotes" and a newline\nSecond line',
        version: "1.2.0",
        comment: "Mapping-set comment",
        curieMap: [
            ...mappingSet.metadata.curieMap,
            { prefix: "EX", iri: "https://example.org/terms/" },
        ],
    };
    mappingSet.mappings = [{
        subjectId: "EX:1",
        subjectLabel: "Source term",
        predicateId: "skos:exactMatch",
        objectId: "EX:2",
        objectLabel: "Target term",
        mappingJustification: "semapv:ManualMappingCuration",
        confidence: 0.75,
        comment: "Example mapping comment",
        authorIds: ["orcid:0000-0002-7356-1779", "orcid:0000-0002-6601-2165"],
        reviewerIds: ["orcid:0000-0002-7356-1779"],
        mappingDate: "2026-10-15",
    }];
    return mappingSet;
}

describe("SSSOM TSV export/import round trip", () => {
    it("preserves supported metadata and all mapping fields", async () => {
        const original = exampleMappingSet();
        const tsv = serializeSssomTsv(original);
        const parsed = await parseSSSOMString(tsv) as ParsedSssomDocument;
        const imported = createMappingSetFromSssom(parsed);

        expect.soft(imported.metadata).toEqual(original.metadata);
        // sssom-js expands CURIE identifiers to full IRIs during parsing.
        expect(imported.mappings).toEqual([{
            ...original.mappings[0],
            subjectId: "https://example.org/terms/1",
            predicateId: "http://www.w3.org/2004/02/skos/core#exactMatch",
            objectId: "https://example.org/terms/2",
            mappingJustification: "https://w3id.org/semapv/vocab/ManualMappingCuration",
            authorIds: ["https://orcid.org/0000-0002-7356-1779", "https://orcid.org/0000-0002-6601-2165"],
            reviewerIds: ["https://orcid.org/0000-0002-7356-1779"],
        }]);
    });

    it("can import an export containing a mailto identifier with a declared prefix", async () => {
        const original = exampleMappingSet();
        original.mappings[0].authorIds = ["mailto:anna@example.org"];

        const parsed = await parseSSSOMString(serializeSssomTsv(original)) as ParsedSssomDocument;
        const imported = createMappingSetFromSssom(parsed);

        expect(imported.mappings[0].authorIds).toEqual(["mailto:anna@example.org"]);
    });
});
