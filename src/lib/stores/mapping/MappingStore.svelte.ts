import { arcStore, type DerivedOntology } from "../arcs/ArcStore.svelte";
import type { MappingSet, ParsedSssomDocument, SssomMapping } from "$lib/types/mapping";
import { warning } from "$lib/services/toasts/toastService";
import {
    createDefaultMappingSet,
    createMappingSetFromSssom,
} from "$lib/services/sssom/parseSssomTsvData";


class MappingStore {
    fileName: string = $state("");
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
        this.createMappingSet();
        this.hasMappingSet = false;
    }

    createMappingSet() {
        this.fileName = "";
        this.loadMappingSet(createDefaultMappingSet());
    }

    loadMappingSet(mappingSet: MappingSet) {
        this.mappingSet = mappingSet;
        this.hasMappingSet = true;
        this.importedSssom = null;
        this.subjectPrefix = "";
        this.startMapping(this.unmappedOntologies);
    }

    loadSssom(sssom: ParsedSssomDocument) {
        this.loadMappingSet(createMappingSetFromSssom(sssom));
        this.importedSssom = sssom;
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
            mappingDate: new Date().toISOString().slice(0, 10),
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

    removeSssomMapping(mapping: SssomMapping) {
        const mappingIndex = this.mappingSet.mappings.indexOf(mapping);
        if (mappingIndex === -1) { return; }
        this.mappingSet.mappings.splice(mappingIndex, 1);
    }


}

export const mappingStore = new MappingStore();
