const OBO_VERSION = "1.4";

export function createOntologyTerm(): OntologyTerm {
    const id = "";
    const name = "";
    const synonyms = [""];
    const xrefs = [""];

    return {
        id,
        name,
        synonyms,
        xrefs,
    };
}

export function importOntologyFile(oboFile: string) {
    console.log(oboFile);

    const lines = oboFile.split("\n").map((l) => l.trim());
    console.log(lines);
    const ontologyFile: OntologyFile = {
        ontology: "mapping",
        formatVersion: "",
        terms: [],
    };

    let currentTerm: OntologyTerm | null = null;

    for (const line of lines) {
        if (!line || line.startsWith("!")) continue; // leere Zeilen oder Kommentare

        // Header
        if (line.startsWith("format-version:")) {
            ontologyFile.formatVersion = line.replace("format-version:", "").trim();
            continue;
        }
        if (line.startsWith("ontology:")) {
            ontologyFile.ontology = line.replace("ontology:", "").trim();
            continue;
        }

        // Neuer Term
        if (line === "[Term]") {
            if (currentTerm) ontologyFile.terms.push(currentTerm);
            currentTerm = { id: "", name: "", synonyms: [], xrefs: [] };
            continue;
        }

        if (!currentTerm) continue; // Zeilen außerhalb von Term ignorieren

        // Term-Felder
        if (line.startsWith("id:")) {
            currentTerm.id = line.replace("id:", "").trim();
        } else if (line.startsWith("name:")) {
            currentTerm.name = line.replace("name:", "").trim();
        } else if (line.startsWith("xref:")) {
            currentTerm.xrefs.push(line.replace("xref:", "").trim());
        } else if (line.startsWith("synonym:")) {
            // extrahiere nur den String zwischen ""
            const match = line.match(/"(.+?)"/);
            if (match) currentTerm.synonyms.push(match[1]);
        }
    }

    // Letzten Term hinzufügen
    if (currentTerm) ontologyFile.terms.push(currentTerm);

    return ontologyFile;
}

export function writeOntologyFile(obo: OntologyFile): string {
    const lines: string[] = [];
    lines.push(`format-version: ${OBO_VERSION}`);
    lines.push(`ontology: ${obo.ontology}`);
    lines.push("");

    obo.terms.forEach((term) => {
        lines.push("[Term]");
        lines.push(`id: ${term.id}`);
        lines.push(`name: ${term.name}`);
        const synonyms = term.synonyms.map((synonym) => `synonym: ${synonym} EXACT[]`).join("\n");
        lines.push(synonyms);
        const xrefs = term.xrefs.map((xref) => `xref: ${xref}`).join("\n");
        lines.push(xrefs);
    });

    return lines.join("\n");
}
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

    console.log(name, propertyID, "extract");

    if (name && propertyID) {
        derivedOntologies.push({
            source: jsonSource,
            key: name,
            value: propertyID ?? "",
            ontologyAttribute: "propertyID"
        });
    }

    if (unitText && unitCode) {
        derivedOntologies.push({
            source: jsonSource,
            key: unitText ?? "",
            value: unitCode ?? "",
            ontologyAttribute: "unitCode"
        });
    }

    if (value && valueReference) {
        derivedOntologies.push({
            source: jsonSource,
            key: value ?? "",
            value: valueReference ?? "",
            ontologyAttribute: "valueReference"
        });
    }

    return derivedOntologies;
}