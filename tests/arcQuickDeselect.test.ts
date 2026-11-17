import { afterEach, describe, expect, it } from "vitest";
import { arcStore } from "$lib/stores/arcs/ArcStore.svelte";
import { mappingStore } from "$lib/stores/mapping/MappingStore.svelte";
import { isNumericValue, isWebUrlValue, valueContainsText } from "$lib/services/arcs/valuePredicates";
import { groupArcTerms } from "$lib/services/arcs/termGroups";

afterEach(() => {
    arcStore.init({ "@context": [], "@graph": [] });
    arcStore.initialised = false;
    mappingStore.reset();
});

describe("quick value deselection", () => {
    it("matches substrings with the requested capitalization when Match case is enabled", () => {
        expect(valueContainsText("HOR", "HOR", true)).toBe(true);
        expect(valueContainsText("HOR 29", " HOR ", true)).toBe(true);
        expect(valueContainsText("Hordeum vulgare", "HOR", true)).toBe(false);
        expect(valueContainsText("HOR_001", "HOR", true)).toBe(true);
        expect(valueContainsText("hor", "HOR", true)).toBe(false);
        expect(valueContainsText("HOR", " ", true)).toBe(false);
        expect(valueContainsText("HOR", ".*", true)).toBe(false);
    });

    it("deselects case-sensitive substring matches while keeping differently capitalized values", () => {
        arcStore.init({ "@context": [], "@graph": [
            { "@id": "one", "@type": "PropertyValue", name: "Code", value: "HOR" },
            { "@id": "two", "@type": "PropertyValue", name: "Organism", value: "Hordeum vulgare" },
            { "@id": "three", "@type": "PropertyValue", name: "Accession", value: "HOR 29" },
        ] });
        arcStore.deselectValuesMatching((value) => valueContainsText(value, "HOR", true));
        expect(arcStore.ontologyCandidates.has("HOR")).toBe(false);
        expect(arcStore.ontologyCandidates.has("Hordeum vulgare")).toBe(true);
        expect(arcStore.ontologyCandidates.has("HOR 29")).toBe(false);
        expect(arcStore.ontologyCandidates.has("Code")).toBe(true);
    });

    it("matches literal text regardless of case and rejects empty queries", () => {
        expect(valueContainsText("Hordeum vulgare", " HOR ")).toBe(true);
        expect(valueContainsText("HOR_001", "hor")).toBe(true);
        expect(valueContainsText("Hordeum vulgare", "  ")).toBe(false);
        expect(valueContainsText("Hordeum vulgare", ".*")).toBe(false);
        expect(valueContainsText("Sample.*", ".*")).toBe(true);
    });

    it("previews selected matching occurrences across properties and deselects only those values", () => {
        mappingStore.createMappingSet();
        arcStore.init({ "@context": [], "@graph": [
            { "@id": "one", "@type": "PropertyValue", name: "Organism", value: "Hordeum vulgare" },
            { "@id": "two", "@type": "PropertyValue", name: "Organism", value: "Hordeum vulgare" },
            { "@id": "three", "@type": "PropertyValue", name: "Host", value: "Hordeum vulgare" },
            { "@id": "four", "@type": "PropertyValue", name: "Accession", value: "HOR_001" },
            { "@id": "five", "@type": "PropertyValue", name: "HOR property", unitText: "HOR unit", value: "Other" },
        ] });
        const manuallyExcluded = arcStore.extractedOntologyValues.find((term) => term.key === "HOR_001")!;
        arcStore.setTermsIncluded([manuallyExcluded], false);
        const matches = (value: string) => valueContainsText(value, "HOR");
        const preview = arcStore.allOntologyValues.filter((term) => term.ontologyAttribute === "valueReference" && matches(term.key));
        expect(preview).toHaveLength(3);
        expect(groupArcTerms(preview).map((group) => group.name)).toEqual(["Organism", "Host"]);
        expect(new Set(preview.map((term) => term.key)).size).toBe(1);

        arcStore.deselectValuesMatching(matches);
        expect(preview.every((term) => !arcStore.isTermIncluded(term))).toBe(true);
        expect(arcStore.ontologyCandidates.has("HOR property")).toBe(true);
        expect(arcStore.ontologyCandidates.has("HOR unit")).toBe(true);
        expect(arcStore.ontologyCandidates.has("Other")).toBe(true);
        expect(arcStore.ontologyCandidates.has("Hordeum vulgare")).toBe(false);
        arcStore.setTermsIncluded(preview, true);
        expect(arcStore.ontologyCandidates.has("Hordeum vulgare")).toBe(true);
        expect(arcStore.isTermIncluded(manuallyExcluded)).toBe(false);
    });

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
