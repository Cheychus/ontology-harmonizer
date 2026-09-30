import { describe, expect, it } from "vitest";
import {
    extractBaseIri,
    extractLocalIdFromObjectId,
    extractPrefixFromObjectId,
    isCurieMapDetailsValid,
} from "$lib/services/sssom/curieMap";

describe("CURIE map helpers", () => {
    it("splits a normal CURIE into prefix and local ID", () => {
        expect(extractPrefixFromObjectId("GO:0008150")).toBe("GO");
        expect(extractLocalIdFromObjectId("GO:0008150")).toBe("0008150");
    });

    it("extracts a Base IRI when the local ID is the IRI suffix", () => {
        expect(
            extractBaseIri(
                "GO:0008150",
                "http://purl.obolibrary.org/obo/GO_0008150",
            ),
        ).toBe("http://purl.obolibrary.org/obo/GO_");
    });

    it("does not derive a prefix from an identifier without a colon", () => {
        expect(extractPrefixFromObjectId("flash")).toBeNull();
    });

    it("returns null if a prefix has no localId", () => {
        expect(extractLocalIdFromObjectId("GO:")).toBeNull();
    });

    it("returns null if a CURIE has no prefix", () => {
        expect(extractPrefixFromObjectId(":123")).toBeNull();
    });

    it("does not derive a Base IRI when the short form does not round-trip", () => {
        expect(
            extractBaseIri(
                "nmrCV2025:NMR_1000005",
                "http://nmrML.org/nmrCV#NMR:1000005",
            ),
        ).toBeNull();
    });

    it("extracts a Base IRI from an identifier without a prefix", () => {
        expect(
            extractBaseIri(
                "flash",
                "http://rs.tdwg.org/abcd/terms/flash",
            ),
        ).toBe("http://rs.tdwg.org/abcd/terms/");
    });

    it("accepts an automatically extracted CURIE map", () => {
        expect(
            isCurieMapDetailsValid(
                "http://purl.obolibrary.org/obo/GO_0008150",
                "GO:0008150",
                "GO",
                "http://purl.obolibrary.org/obo/GO_",
            ),
        ).toBe(true);
    });

    it("accepts a manually defined prefix for an identifier without a prefix", () => {
        expect(
            isCurieMapDetailsValid(
                "http://rs.tdwg.org/abcd/terms/flash",
                "flash",
                "TDWG",
                "http://rs.tdwg.org/abcd/terms/",
            ),
        ).toBe(true);
    });

    it("rejects an empty prefix", () => {
        expect(
            isCurieMapDetailsValid(
                "http://rs.tdwg.org/abcd/terms/flash",
                "flash",
                "",
                "http://rs.tdwg.org/abcd/terms/",
            ),
        ).toBe(false);
    });

    it("rejects a Base IRI that does not reconstruct the full IRI", () => {
        expect(
            isCurieMapDetailsValid(
                "http://nmrML.org/nmrCV#NMR:1000005",
                "nmrCV2025:NMR_1000005",
                "nmrCV2025",
                "http://nmrML.org/nmrCV#",
            ),
        ).toBe(false);
    });

    it("rejects an empty Base IRI", () => {
        expect(
            isCurieMapDetailsValid("flash", "flash", "TDWG", ""),
        ).toBe(false);
    });

    it("rejects an object ID without a local ID", () => {
        expect(
            isCurieMapDetailsValid(
                "http://example.org/GO_",
                "GO:",
                "GO",
                "http://example.org/GO_",
            ),
        ).toBe(false);
    });
});