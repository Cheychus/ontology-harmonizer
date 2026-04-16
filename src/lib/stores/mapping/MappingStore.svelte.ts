import mappingStr from "$lib/assets/mappings/mapping.json?raw";
import { iriToCurie } from "$lib/services/oboFiles/oboFile.service";
import { arcStore, type DerivedOntology } from "../arcs/ArcStore.svelte";


export interface IMapping {
    name: string;
    iri: string;
    synonyms: string[];
    shortForm: string;
}


class MappingStore {
    fileName: string = $state("");
    mappingJson: IMapping[] = $state([])
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



    constructor(mappingStr: IMapping[]) {
        // this.load(mappingStr)
    }

    reset() {
        this.fileName = "";
        this.mappingJson = [];
    }

    load(mapping: IMapping[]) {
        console.log("Mapping json loaded: ", mapping);
        this.mappingJson = mapping;
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
            synonyms: [synonym],
            shortForm
        }
        this.mappingJson.push(mapping)
        return mapping;
    }

    findMapping(name: string) {
        return this.mappingJson.find((m) => m.name === name || m.synonyms.find((s) => s === name)) ?? null;
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
        console.log(replacedIri, replacedShortForm)
        return replacedIri.includes(replacedShortForm);
    }

}

export const mappingStore = new MappingStore(JSON.parse(mappingStr) as IMapping[]);