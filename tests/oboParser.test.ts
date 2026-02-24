import { describe, it, expect } from "vitest";
import { createOntologyTerm, parseOntologyFile, writeOntologyFile } from "../src/lib/services/oboFiles/oboFile.service";
import valid1 from "./fixtures/valid1.obo?raw";
import valid2 from "./fixtures/valid2.obo?raw";
import valid3 from "./fixtures/valid3.obo?raw";
import valid4 from "./fixtures/valid4.obo?raw";
import invalid1 from "./fixtures/invalid1.obo?raw";
import type { OboSynonym, OboTerm } from "$lib/types/oboFiles";


// const file = fs.readFileSync("tests/fixtures/valid1.obo", "utf-8");

describe("OBO Parser", () => {

    it("parse only header file", () => {
        const result = parseOntologyFile(valid1);
        expect(result.formatVersion).toBe("1.4");
        expect(result.ontology).toBe("only-header");
        expect(result.terms.length).toBe(0);
    });

    it("parse file with header and one simple term", () => {
        const result = parseOntologyFile(valid2);
        expect(result.terms.length).toBe(1);
        expect(result.terms[0].id).toBe("OBO:0000001");
        expect(result.terms[0].name).toBe("organism");
    });

    it("parse file with multiple terms, synonyms and xrefs in synonyms", () => {
        const result = parseOntologyFile(valid3);
        expect(result.terms.length).toBe(5);
        expect(result.terms[0].id).toBe("ARC:0000001");
        expect(result.terms[0].name).toBe("term1");
        expect(result.terms[0].synonyms.length).toBe(4);
        expect(result.terms[0].synonyms[0].synonymText).toBe("Test Synonym");
        expect(result.terms[0].synonyms[0].scopeIdentifier).toBe("EXACT");
        expect(result.terms[0].synonyms[0].synonymTypeName).toBe("SCOPE_LITERAL");
        expect(result.terms[0].synonyms[0].xrefList).toStrictEqual([]);
        expect(result.terms[0].synonyms[1].synonymText).toBe("Test Synonym without array");
        expect(result.terms[0].synonyms[1].scopeIdentifier).toBe("EXACT");
        expect(result.terms[0].synonyms[1].synonymTypeName).toBe("SCOPE_LITERAL");
        expect(result.terms[0].synonyms[1].xrefList).toBe(undefined);
        expect(result.terms[0].synonyms[3].synonymText).toBe("The other white meat");
        expect(result.terms[0].synonyms[3].scopeIdentifier).toBe("EXACT");
        expect(result.terms[0].synonyms[3].synonymTypeName).toBe("MARKETING_SLOGAN");
        expect(result.terms[0].synonyms[3].xrefList).toStrictEqual(['MEAT:00324', 'BACONBASE:03021']);
        expect(result.terms[4].id).toBe("ARC:0000005");
        expect(result.terms[4].name).toBe("term5");
        expect(result.terms[4].synonyms.length).toBe(1);
        expect(result.terms[4].synonyms[0].synonymText).toBe("Test Synonym");
        expect(result.terms[4].synonyms[0].scopeIdentifier).toBe("EXACT");
        expect(result.terms[4].synonyms[0].synonymTypeName).toBe(undefined);

        expect(result.terms[0].xrefs.length).toBe(1);


    });

    it("parse invalid file and throw error", () => {
        expect(() => parseOntologyFile(invalid1)).toThrow();
    });

    it("change obo file (add term)", () => {
        const obo = parseOntologyFile(valid4);
        expect(obo.terms.length).toBe(1);
        const ontoTerm: OboTerm = {
            id: "OBO:0000001",
            name: "new term",
            synonyms: [],
            xrefs: ["OBI:00000001"]
        }
        const synonym1: OboSynonym = {
            synonymText: "synonym1",
            scopeIdentifier: "EXACT",
        }
        ontoTerm.synonyms.push(synonym1);
        obo.terms.push(ontoTerm);
        const oboString = writeOntologyFile(obo);
        const reparse = parseOntologyFile(oboString);
        expect(reparse.terms.length).toBe(2);
        expect(reparse.terms[1].id).toBe("OBO:0000001");
        expect(reparse.terms[1].name).toBe("new term");
        expect(reparse.terms[1].synonyms.length).toBe(1);
        expect(reparse.terms[1].synonyms[0].synonymText).toBe("synonym1");
        expect(reparse.terms[1].synonyms[0].scopeIdentifier).toBe("EXACT");
        expect(reparse.terms[1].xrefs.length).toBe(1);
        expect(reparse.terms[1].xrefs[0]).toBe("OBI:00000001");
    });
})