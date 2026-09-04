import mappingStr from "$lib/assets/mappings/mapping.json?raw";
import { arcStore, type DerivedOntology } from "../arcs/ArcStore.svelte";
import type { MappingSet, ParsedSssomDocument } from "$lib/types/mapping";


export interface IMapping {
    name: string;
    iri: string;
    synonyms: string[];
    shortForm: string;
}


class MappingStore {
    fileName: string = $state("");
    mappingJson: IMapping[] = $state([])
    hasMappingSet = $state(true);
    mappingSetMetadata: MappingSet["metadata"] = $state(this.createDefaultMetadata());
    importedSssom: ParsedSssomDocument | null = $state(null);
    private arcOntologies = $derived(arcStore.ontologyCandidates.values().toArray());
    mappedOntologies = $derived(this.arcOntologies.filter((o) => this.findMapping(o.key)));
    unmappedOntologies = $derived(this.arcOntologies.filter((o) => mappingStore.findMapping(o.key) === null));

    currentIndex = $state(0);

    current: DerivedOntology | null = $state(null);
    queue: DerivedOntology[] = $state([]);
    skipped: DerivedOntology[] = $state([]);

    moveNext() {
        this.current = this.queue[0] ?? null;
        this.queue = this.queue.slice(1);
    }

    skip() {
        if (!this.current) return;
        this.skipped = [...this.skipped, this.current];
        this.moveNext();
    }

    undoSkip(index: number) {
        const item = this.skipped[index];
        this.skipped = this.skipped.filter((_, i) => i !== index);
        this.queue = [item, ...this.queue];

        if (!this.current) {
            this.moveNext();
        }
    }

    startMapping(ontologies: DerivedOntology[]) {
        this.skipped = [];
        this.queue = ontologies;
        this.current = this.queue.shift() ?? null;
    }

    reset() {
        this.fileName = "";
        this.mappingJson = [];
        this.hasMappingSet = false;
        this.mappingSetMetadata = this.createDefaultMetadata();
        this.importedSssom = null;
        this.startMapping(this.unmappedOntologies)
    }

    load(mapping: IMapping[]) {
        this.mappingJson = mapping;
        this.hasMappingSet = true;
        this.mappingSetMetadata = this.createDefaultMetadata();
        this.importedSssom = null;
        this.startMapping(this.unmappedOntologies);
    }

    createMappingSet() {
        this.fileName = "";
        this.mappingJson = [];
        this.hasMappingSet = true;
        this.mappingSetMetadata = this.createDefaultMetadata();
        this.importedSssom = null;
        this.startMapping(this.unmappedOntologies);
    }

    loadSssom(sssom: ParsedSssomDocument) {
        const defaults = this.createDefaultMetadata();

        this.mappingJson = [];
        this.hasMappingSet = true;
        this.importedSssom = sssom;
        this.mappingSetMetadata = {
            ...defaults,
            mappingSetId: sssom.mapping_set_id as string,
            license: sssom.license as string,
            curieMap: sssom.curie_map
                ? Object.entries(sssom.curie_map as Record<string, string>).map(([prefix, iri]) => ({ prefix, iri }))
                : [],
            title: (sssom.mapping_set_title as string | undefined) ?? "",
            description: (sssom.mapping_set_description as string | undefined) ?? "",
            version: (sssom.mapping_set_version as string | undefined) ?? "",
            comment: (sssom.comment as string | undefined) ?? "",
        };
        this.startMapping(this.unmappedOntologies);
    }

    addCurieMapEntry() {
        this.mappingSetMetadata.curieMap.push({ prefix: "", iri: "" });
    }

    removeCurieMapEntry(index: number) {
        this.mappingSetMetadata.curieMap.splice(index, 1);
    }

    addMapping(name: string, iri: string, synonym: string, shortForm: string) {
        let mapping = this.findMapping(name);

        if (mapping) {
            mapping.synonyms.push(synonym)
            return mapping;
        }

        mapping = {
            iri,
            name,
            synonyms: name === synonym ? [] : [synonym],
            shortForm
        }
        this.mappingJson.push(mapping)
        return mapping;
    }

    findMapping(name: string) {
        return this.mappingJson.find((m) => m.name.toLowerCase() === name.toLowerCase() || m.synonyms.find((s) => s.toLowerCase() === name.toLowerCase())) ?? null;
    }

    findMappings(query: string) {
        if (!query) return this.mappingJson;
        const q = query.toLowerCase();
        return this.mappingJson.filter(
            (m) =>
                m.name.toLowerCase().includes(q) ||
                m.synonyms.some((s) => s.toLowerCase().includes(q))
        );
    }

    removeMapping(index: number) {
        return this.mappingJson.splice(index, 1);
    }

    removeSynonym(mapping: IMapping, index: number) {
        const deleted = mapping.synonyms.splice(index, 1);
        return deleted;
    }

    addSynonym(mapping: IMapping, synonym: string) {
        return mapping.synonyms.push(synonym);
    }

    iriIncludesShortForm(iri: string, shortForm: string) {
        const replacedIri = iri.replace("_", ":").toLowerCase();
        const replacedShortForm = shortForm.replace("_", ":").toLowerCase();
        return replacedIri.includes(replacedShortForm);
    }

    private createDefaultMetadata(): MappingSet["metadata"] {
        return {
            mappingSetId: "mapping",
            license: "CC-BY-4.0",
            curieMap: [
                {
                    prefix: "skos",
                    iri: "http://www.w3.org/2004/02/skos/core#"
                },
                {
                    prefix: "semapv",
                    iri: "https://w3id.org/semapv/vocab/"
                },
                {
                    prefix: "orcid",
                    iri: "https://orcid.org/"
                }
            ],
            title: "",
            description: "",
            version: "1.0.0",
            comment: "",
        };
    }

}

export const mappingStore = new MappingStore();
