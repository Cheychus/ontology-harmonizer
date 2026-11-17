import { afterEach, describe, expect, it } from "vitest";
import { arcStore } from "$lib/stores/arcs/ArcStore.svelte";
import { mappingStore } from "$lib/stores/mapping/MappingStore.svelte";
import { isNumericValue, isWebUrlValue } from "$lib/services/arcs/valuePredicates";

afterEach(() => {
    arcStore.init({ "@context": [], "@graph": [] });
    arcStore.initialised = false;
    mappingStore.reset();
});

describe("quick value deselection", () => {
    it.each([
        ["https://doi.org/10.1234/example", true],
        [" http://example.org/data?a=1 ", true],
        ["Hordeum vulgare", false],
        ["10.1234/example", false],
        ["https://", false],
        ["", false],
    ])("recognizes web URL %s: %s", (value, expected) => {
        expect(isWebUrlValue(value)).toBe(expected);
    });

    it("does not interpret blank values as numbers", () => {
        expect(isNumericValue(" ")).toBe(false);
    });

    it("deselects numbers and URLs once, preserving names, units and manual choices", () => {
        mappingStore.createMappingSet();
        arcStore.init({ "@context": [], "@graph": [
            { "@id": "n1", "@type": "PropertyValue", name: "100.4", unitText: "123", value: "100.4" },
            { "@id": "n2", "@type": "PropertyValue", name: "Temperature", value: "100,4" },
            { "@id": "n3", "@type": "PropertyValue", name: "Temperature", value: 0 },
            { "@id": "url", "@type": "PropertyValue", name: "Publication", value: "https://doi.org/10.1234/example" },
            { "@id": "url-name", "@type": "PropertyValue", name: "https://example.org", value: "Hordeum vulgare" },
            { "@id": "text", "@type": "PropertyValue", name: "Note", value: "100 mg" },
        ] });
        const originalJson = JSON.stringify(arcStore.json);
        const text = arcStore.extractedOntologyValues.find((term) => term.key === "100 mg")!;
        arcStore.setTermsIncluded([text], false);

        arcStore.deselectValuesMatching(isNumericValue);
        arcStore.deselectValuesMatching(isWebUrlValue);
        expect(arcStore.allOntologyValues.filter((term) => term.ontologyAttribute === "valueReference").map((term) => term.key))
            .toEqual(["Hordeum vulgare"]);
        expect(arcStore.ontologyCandidates.has("100.4")).toBe(true); // Property name is retained.
        expect(arcStore.ontologyCandidates.has("123")).toBe(true); // Unit is retained.
        expect(arcStore.ontologyCandidates.has("https://example.org")).toBe(true);
        expect(arcStore.isTermIncluded(text)).toBe(false);
        expect(mappingStore.queue.some((term) => term.key === "100,4")).toBe(false);
        expect(JSON.stringify(arcStore.json)).toBe(originalJson);

        // Quick actions leave no active rule: individual values can be reselected.
        const number = arcStore.extractedOntologyValues.find((term) => term.key === "100,4")!;
        arcStore.setTermsIncluded([number], true);
        expect(arcStore.isTermIncluded(number)).toBe(true);
        expect(arcStore.ontologyCandidates.has("100,4")).toBe(true);
    });
});
