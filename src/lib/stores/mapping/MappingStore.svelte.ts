import { arcStore, type DerivedOntology } from "../arcs/ArcStore.svelte";
import type { MappingSet, ParsedSssomDocument, SssomMapping } from "$lib/types/mapping";
import { warning } from "$lib/services/toasts/toastService";
import {
    createDefaultMappingSet,
    createMappingSetFromSssom,
} from "$lib/services/sssom/sssom";


/** @deprecated Legacy JSON mapping shape. Use SssomMapping for new features. */
export interface IMapping {
    name: string;
    iri: string;
    synonyms: string[];
    shortForm: string;
}


class MappingStore {
    fileName: string = $state("");
    /** @deprecated Legacy JSON mappings. Use mappingSet.mappings instead. */
    mappingJson: IMapping[] = $state([])
    hasMappingSet = $state(true);
    mappingSet: MappingSet = $state(createDefaultMappingSet());
    subjectPrefix = $state("");
    importedSssom: ParsedSssomDocument | null = $state(null);
    private arcOntologies = $derived(arcStore.ontologyCandidates.values().toArray());
    mappedOntologies = $derived(this.arcOntologies.filter((o) => this.hasSssomMapping(o)));
    unmappedOntologies = $derived(this.arcOntologies.filter((o) => !this.hasSssomMapping(o)));
    mappedSssomMappings = $derived(
        this.mappedOntologies.flatMap((ontology) => {
            const mapping = this.findSssomMapping(ontology);
            return mapping ? [mapping] : [];
        }),
    );

    currentIndex = $state(0);

    current: DerivedOntology | null = $state(null);
    queue: DerivedOntology[] = $state([]);
    skipped: DerivedOntology[] = $state([]);

    get subjectIdentifier() {
        const entry = this.mappingSet.metadata.curieMap.find((candidate) => candidate.prefix === this.subjectPrefix);
        return { prefix: entry?.prefix ?? "", uri: entry?.iri ?? "" };
    }

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
        this.mappingSet = createDefaultMappingSet();
        this.subjectPrefix = "";
        this.importedSssom = null;
        this.startMapping(this.unmappedOntologies)
    }

    /** @deprecated Loads the legacy JSON mapping format. Use loadSssom instead. */
    load(mapping: IMapping[]) {
        this.mappingJson = mapping;
        this.hasMappingSet = true;
        this.mappingSet = createDefaultMappingSet();
        this.subjectPrefix = "";
        this.importedSssom = null;
        this.startMapping(this.unmappedOntologies);
    }

    createMappingSet() {
        this.fileName = "";
        this.mappingJson = [];
        this.hasMappingSet = true;
        this.mappingSet = createDefaultMappingSet();
        this.subjectPrefix = "";
        this.importedSssom = null;
        this.startMapping(this.unmappedOntologies);
    }

    loadSssom(sssom: ParsedSssomDocument) {
        const mappingSet = createMappingSetFromSssom(sssom);

        this.mappingJson = [];
        this.hasMappingSet = true;
        this.importedSssom = sssom;
        this.mappingSet = mappingSet;
        this.subjectPrefix = "";
        this.startMapping(this.unmappedOntologies);
        console.log(sssom, this.mappingSet)
    }

    addCurieMapEntry(prefix: string, iri: string) {
        if (!prefix || !iri || this.mappingSet.metadata.curieMap.some((entry) => entry.prefix === prefix)) {
            return false;
        }

        this.mappingSet.metadata.curieMap.push({ prefix, iri });
        return true;
    }

    removeCurieMapEntry(index: number) {
        if (this.mappingSet.metadata.curieMap[index]?.prefix === this.subjectPrefix) {
            this.subjectPrefix = "";
        }
        this.mappingSet.metadata.curieMap.splice(index, 1);
    }

    addSssomMapping(mapping: SssomMapping): boolean {
        const alreadyMapped = this.mappingSet.mappings.some((existing) => existing.subjectId === mapping.subjectId);
        if (alreadyMapped) {
            warning(`Mapping for [${mapping.subjectId}] already defined`);
            return false;
        }

        this.mappingSet.mappings.push({
            ...mapping,
            authorIds: mapping.authorIds?.map((authorId) => authorId.trim()).filter(Boolean),
            comment: mapping.comment?.trim() || undefined,
        });
        return true;
    }

    findSssomMapping(ontology: DerivedOntology): SssomMapping | undefined {
        return this.mappingSet.mappings.find((mapping) => mapping.subjectLabel === ontology.key);
    }

    hasSssomMapping(ontology: DerivedOntology): boolean {
        return this.findSssomMapping(ontology) !== undefined;
    }

    /** @deprecated Adds a legacy JSON mapping. Use addSssomMapping instead. */
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

    /** @deprecated Searches legacy JSON mappings. */
    findMapping(name: string) {
        return this.mappingJson.find((m) => m.name.toLowerCase() === name.toLowerCase() || m.synonyms.find((s) => s.toLowerCase() === name.toLowerCase())) ?? null;
    }

    /** @deprecated Searches legacy JSON mappings. */
    findMappings(query: string) {
        if (!query) return this.mappingJson;
        const q = query.toLowerCase();
        return this.mappingJson.filter(
            (m) =>
                m.name.toLowerCase().includes(q) ||
                m.synonyms.some((s) => s.toLowerCase().includes(q))
        );
    }

    /** @deprecated Removes a legacy JSON mapping. */
    removeMapping(index: number) {
        return this.mappingJson.splice(index, 1);
    }

    /** @deprecated Removes a synonym from a legacy JSON mapping. */
    removeSynonym(mapping: IMapping, index: number) {
        const deleted = mapping.synonyms.splice(index, 1);
        return deleted;
    }

    /** @deprecated Adds a synonym to a legacy JSON mapping. */
    addSynonym(mapping: IMapping, synonym: string) {
        return mapping.synonyms.push(synonym);
    }

    /** @deprecated Legacy JSON mapping helper. */
    iriIncludesShortForm(iri: string, shortForm: string) {
        const replacedIri = iri.replace("_", ":").toLowerCase();
        const replacedShortForm = shortForm.replace("_", ":").toLowerCase();
        return replacedIri.includes(replacedShortForm);
    }

}

export const mappingStore = new MappingStore();
