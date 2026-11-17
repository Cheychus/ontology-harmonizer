import { afterEach, describe, expect, it } from "vitest";
import { extractOntologies } from "$lib/services/arcs/arcOntology.service";
import { arcStore } from "$lib/stores/arcs/ArcStore.svelte";
import { mappingStore } from "$lib/stores/mapping/MappingStore.svelte";

afterEach(() => {
    arcStore.init({ "@context": [], "@graph": [] });
    arcStore.initialised = false;
    mappingStore.reset();
});

describe("ARC term filters", () => {
    it("keeps the standard behavior for missing, empty and populated reference attributes", () => {
        const node: GraphNode = {
            "@id": "temperature", "@type": "PropertyValue",
            name: "Temperature", unitText: "degree Celsius", value: "100.4",
        };
        expect(extractOntologies(node, "standard")).toEqual([]);
        expect(extractOntologies({ ...node, propertyID: "", unitCode: ["EX:unit"], valueReference: "EX:value" }, "standard"))
            .toMatchObject([
                { key: "Temperature", value: "", ontologyAttribute: "propertyID" },
                { key: "degree Celsius", value: "EX:unit", ontologyAttribute: "unitCode" },
                { key: "100.4", value: "EX:value", ontologyAttribute: "valueReference" },
            ]);
    });

    it("includes missing references and numeric values without changing the source", () => {
        const node: GraphNode = {
            "@id": "temperature", "@type": "PropertyValue",
            name: "Temperature", unitText: "degree Celsius", value: 100.4,
        };
        expect(extractOntologies(node)).toMatchObject([
            { key: "Temperature", value: "", ontologyAttribute: "propertyID" },
            { key: "degree Celsius", value: "", ontologyAttribute: "unitCode" },
            { key: "100.4", value: "", ontologyAttribute: "valueReference" },
        ]);
        expect(node).not.toHaveProperty("propertyID");
        expect(node).not.toHaveProperty("unitCode");
        expect(node).not.toHaveProperty("valueReference");
        expect(extractOntologies({ ...node, value: 0 }, "all")[2].key).toBe("0");
        expect(extractOntologies({ ...node, name: " ", unitText: "", value: "\t" }, "all")).toEqual([]);
    });

    it.each([100.4, 0, "100.4", "100,4", "-80", "0", " 99.3 ", "1.2e-3"])(
        "excludes numeric value %s while retaining property names and units",
        (value) => {
            const node: GraphNode = {
                "@id": "measurement", "@type": "PropertyValue",
                name: "Temperature", unitText: "degree Celsius", value,
            };
            expect(extractOntologies(node, "exclude-numeric").map((term) => term.key))
                .toEqual(["Temperature", "degree Celsius"]);
            expect(node.value).toBe(value);
        },
    );

    it.each(["Sample_001", "100 mg", "Hordeum vulgare", "1.2.3"])(
        "keeps text value %s",
        (value) => {
            expect(extractOntologies({ "@id": "text", "@type": "PropertyValue", value }, "exclude-numeric"))
                .toMatchObject([{ key: value, ontologyAttribute: "valueReference" }]);
        },
    );

    it("only excludes numeric values, including those with existing references", () => {
        expect(extractOntologies({
            "@id": "numeric-labels", "@type": "PropertyValue",
            name: "123", unitText: "456", value: "789", valueReference: "EX:number",
        }, "exclude-numeric").map((term) => term.key)).toEqual(["123", "456"]);
    });

    it("updates candidates and the mapping queue when switching filters and resets for another ARC", () => {
        arcStore.init({ "@context": [], "@graph": [
            { "@id": "first", "@type": "PropertyValue", name: "Temperature", value: "100.4" },
            { "@id": "second", "@type": "PropertyValue", name: "Temperature", value: "100.5" },
            { "@id": "dataset", "@type": "Dataset", name: "Unrelated dataset" },
        ] });
        expect(arcStore.termFilter).toBe("all");
        expect([...arcStore.ontologyCandidates.keys()]).toEqual(["Temperature", "100.4", "100.5"]);
        expect(arcStore.allOntologyValues).toHaveLength(4);
        expect(mappingStore.current?.key).toBe("Temperature");
        expect(mappingStore.queue.map((term) => term.key)).toEqual(["100.4", "100.5"]);
        arcStore.setTermFilter("exclude-numeric");
        expect([...arcStore.ontologyCandidates.keys()]).toEqual(["Temperature"]);
        expect(mappingStore.current?.key).toBe("Temperature");
        expect(mappingStore.queue).toEqual([]);
        arcStore.setTermFilter("standard");
        expect(arcStore.ontologyCandidates.size).toBe(0);
        expect(mappingStore.current).toBeNull();
        expect(mappingStore.queue).toEqual([]);
        arcStore.init({ "@context": [], "@graph": [] });
        expect(arcStore.termFilter).toBe("all");
    });

    it("creates missing reference attributes when applying mappings and retains the chosen filter", () => {
        mappingStore.createMappingSet();
        mappingStore.addCurieMapEntry("EX", "https://example.org/terms/");
        arcStore.init({ "@context": [], "@graph": [
            { "@id": "organism", "@type": "PropertyValue", name: "Organism", value: "barley" },
        ] });
        arcStore.setTermFilter("all");
        for (const [subjectLabel, term] of [["Organism", "organism"], ["barley", "barley"]]) {
            mappingStore.addSssomMapping({
                subjectId: `EX:source-${term}`, subjectLabel, objectId: `EX:${term}`,
                predicateId: "skos:exactMatch", mappingJustification: "semapv:ManualMappingCuration",
            });
        }
        expect(arcStore.applyMapping()).toBe(2);
        expect(arcStore.json?.["@graph"][0]).toMatchObject({
            name: "Organism", value: "barley",
            propertyID: "https://example.org/terms/organism",
            valueReference: "https://example.org/terms/barley",
        });
        expect(arcStore.termFilter).toBe("all");
        expect(arcStore.ontologyCandidates.size).toBe(2);
        expect(arcStore.applyMapping()).toBe(0);
    });
});
