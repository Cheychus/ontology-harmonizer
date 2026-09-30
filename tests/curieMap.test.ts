import { describe, expect, it } from "vitest";
import {
    extractBaseIri,
    extractLocalIdFromCurie,
    extractPrefixFromCurie,
} from "$lib/services/sssom/curieMap";

describe("CURIE map helpers", () => {
    it("splits a normal CURIE into prefix and local ID", () => {
        expect(extractPrefixFromCurie("GO:0008150")).toBe("GO");
        expect(extractLocalIdFromCurie("GO:0008150")).toBe("0008150");
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
        expect(extractPrefixFromCurie("flash")).toBeNull();
    });

    it("returns null if a prefix has no localId", () => {
        expect(extractLocalIdFromCurie("GO:")).toBeNull();
    });

    it("returns null if a CURIE has no prefix", () => {
        expect(extractPrefixFromCurie(":123")).toBeNull();
    });

    it("does not derive a Base IRI when the short form does not round-trip", () => {
        expect(
            extractBaseIri(
                "nmrCV2025:NMR_1000005",
                "http://nmrML.org/nmrCV#NMR:1000005",
            ),
        ).toBeNull();
    });
});