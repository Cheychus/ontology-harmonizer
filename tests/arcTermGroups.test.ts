import { afterEach, describe, expect, it } from "vitest";
import { groupArcTerms } from "$lib/services/arcs/termGroups";
import { arcStore } from "$lib/stores/arcs/ArcStore.svelte";
import { mappingStore } from "$lib/stores/mapping/MappingStore.svelte";

function loadArc() {
    mappingStore.createMappingSet();
    arcStore.init({ "@context": [], "@graph": [
        { "@id": "t1", "@type": "PropertyValue", name: "Temperature", unitText: "Celsius", value: "100.4" },
        { "@id": "t2", "@type": "PropertyValue", name: "Temperature", unitText: "Celsius", value: "100.4" },
        { "@id": "t3", "@type": "PropertyValue", name: "Temperature", unitText: "Kelvin", value: "200" },
        { "@id": "other", "@type": "PropertyValue", name: "Other", value: "100.4" },
        { "@id": "role", "@type": "PropertyValue", name: "100.4", value: "barley" },
        { "@id": "unnamed", "@type": "PropertyValue", value: "No property name" },
    ] });
    arcStore.setTermFilter("all");
}

afterEach(() => {
    arcStore.init({ "@context": [], "@graph": [] });
    arcStore.initialised = false;
    mappingStore.reset();
});

describe("grouped ARC term selection", () => {
    it("counts repeated labels once globally while retaining each property's occurrences", () => {
        arcStore.init({ "@context": [], "@graph": [
            { "@id": "one", "@type": "PropertyValue", name: "Organism", value: "Hordeum vulgare" },
            { "@id": "two", "@type": "PropertyValue", name: "Organism", value: "Hordeum vulgare" },
            { "@id": "three", "@type": "PropertyValue", name: "Host organism", value: "Hordeum vulgare" },
        ] });
        const groups = groupArcTerms(arcStore.extractedOntologyValues);
        expect(arcStore.termFilter).toBe("all");
        expect(arcStore.ontologyCandidates.size).toBe(3);
        expect(groups[0].values).toHaveLength(1);
        expect(groups[0].valueOccurrences).toBe(2);
        expect(groups[1].values).toHaveLength(1);
        expect(groups[1].valueOccurrences).toBe(1);
        expect(arcStore.allOntologyValues.filter((term) => term.key === "Hordeum vulgare")).toHaveLength(3);
    });

    it("groups repeated values and units by property and includes unnamed properties", () => {
        loadArc();
        const groups = groupArcTerms(arcStore.extractedOntologyValues);
        expect(groups).toHaveLength(4);
        expect(groups[0].name).toBe("Temperature");
        expect(groups[0].property?.occurrences).toHaveLength(3);
        expect(groups[0].units.map((option) => option.label)).toEqual(["Celsius", "Kelvin"]);
        expect(groups[0].values.map((option) => option.label)).toEqual(["100.4", "200"]);
        expect(groups[0].values[0].occurrences).toHaveLength(2);
        expect(groups[0].valueOccurrences).toBe(3);
        expect(groups[3]).toMatchObject({ name: "", property: null, values: [{ label: "No property name" }] });
    });

    it("excludes a value group independently from names, units and values of other properties", () => {
        loadArc();
        const group = groupArcTerms(arcStore.extractedOntologyValues)[0];
        const valueTerms = group.values.flatMap((option) => option.occurrences);
        arcStore.setTermsIncluded(valueTerms, false);

        expect(arcStore.allOntologyValues.filter((term) => term.source.name === "Temperature")
            .every((term) => term.ontologyAttribute !== "valueReference")).toBe(true);
        expect(arcStore.allOntologyValues.some((term) => term.source.name === "Other" && term.key === "100.4")).toBe(true);
        expect(arcStore.allOntologyValues.some((term) => term.key === "100.4" && term.ontologyAttribute === "propertyID")).toBe(true);
        expect(arcStore.ontologyCandidates.has("200")).toBe(false);
        expect(mappingStore.queue.some((term) => term.key === "200")).toBe(false);
        expect(groupArcTerms(arcStore.extractedOntologyValues)[0].values).toHaveLength(2);

        // Restore one distinct value (both occurrences) and independently exclude the name.
        arcStore.setTermsIncluded(group.values[0].occurrences, true);
        arcStore.setTermsIncluded(group.property!.occurrences, false);
        expect(arcStore.allOntologyValues.filter((term) => term.source.name === "Temperature" && term.key === "100.4"))
            .toHaveLength(2);
        expect(arcStore.ontologyCandidates.has("Temperature")).toBe(false);
        expect(arcStore.ontologyCandidates.has("Celsius")).toBe(true);
        arcStore.setTermFilter("standard");
        arcStore.setTermFilter("all");
        expect(arcStore.ontologyCandidates.has("200")).toBe(false);
        expect(arcStore.ontologyCandidates.has("Temperature")).toBe(false);
    });

    it("only applies mappings to selected occurrences and preserves exclusions after extraction", () => {
        loadArc();
        const group = groupArcTerms(arcStore.extractedOntologyValues)[0];
        arcStore.setTermsIncluded(group.values.flatMap((option) => option.occurrences), false);
        mappingStore.addCurieMapEntry("EX", "https://example.org/");
        mappingStore.addSssomMapping({
            subjectId: "EX:source", subjectLabel: "100.4", objectId: "EX:target",
            predicateId: "skos:exactMatch", mappingJustification: "semapv:ManualMappingCuration",
        });

        expect(arcStore.applyMapping()).toBe(2);
        const nodes = arcStore.json!["@graph"];
        expect(nodes[0]).not.toHaveProperty("valueReference");
        expect(nodes[1]).not.toHaveProperty("valueReference");
        expect(nodes[3].valueReference).toBe("https://example.org/target");
        expect(nodes[4].propertyID).toBe("https://example.org/target");
        expect(arcStore.ontologyCandidates.has("200")).toBe(false);
        expect(arcStore.isTermIncluded(group.values[0].occurrences[0])).toBe(false);

        arcStore.init({ "@context": [], "@graph": [{
            "@id": "new", "@type": "PropertyValue", name: "Temperature", value: "200",
        }] });
        arcStore.setTermFilter("all");
        expect(arcStore.ontologyCandidates.has("200")).toBe(true);
    });
});
