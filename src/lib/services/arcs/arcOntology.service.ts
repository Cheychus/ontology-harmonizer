import type { DerivedOntology } from "$lib/stores/ArcStore.svelte";

/**
 * Ontologies can be saved in different attributes
 * @param node 
 * @returns 
 */
export function extractOntologies(node: GraphNode): DerivedOntology[] {
    const jsonSource = node;
    const name = node.name;
    const propertyID = node.propertyID;
    const unitText = node.unitText;
    const unitCode = node.unitCode;
    const value = node.value;
    const valueReference = node.valueReference;

    const derivedOntologies: DerivedOntology[] = [];

    if (name && propertyID != null) {
        derivedOntologies.push({
            source: jsonSource,
            key: name,
            value: propertyID,
            ontologyAttribute: "propertyID"
        });
    }

    if (unitText && unitCode != null) {
        derivedOntologies.push({
            source: jsonSource,
            key: unitText,
            value: unitCode,
            ontologyAttribute: "unitCode"
        });
    }

    if (value && valueReference != null) {
        derivedOntologies.push({
            source: jsonSource,
            key: value,
            value: valueReference,
            ontologyAttribute: "valueReference"
        });
    }

    return derivedOntologies;
}