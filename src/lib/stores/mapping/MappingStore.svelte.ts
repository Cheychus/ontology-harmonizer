import { arcStore, type DerivedOntology } from "../arcs/ArcStore.svelte";
import type { MappingSet, ParsedSssomDocument, SssomMapping } from "$lib/types/mapping";
import { warning } from "$lib/services/toasts/toastService";
import { extractPrefixFromObjectId } from "$lib/services/sssom/curieMap";
import {
    createDefaultMappingSet,
    createMappingSetFromSssom,
} from "$lib/services/sssom/parseSssomTsvData";


class MappingStore {
    fileName: string = $state("");
    hasMappingSet = $state(false);
    mappingSet: MappingSet = $state(createDefaultMappingSet());
    subjectPrefix = $state("");
    arcSourcePrefix = $state("");
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
        this.arcSourcePrefix = "";
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

    setArcTermSource(prefix: string, iri: string): string | null {
        prefix = prefix.trim();
        iri = iri.trim();
        if (!prefix) {
            return "Enter a prefix.";
        }
        try {
            const url = new URL(iri);
            if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error();
        } catch {
            return "Enter a complete base IRI starting with https:// or http://.";
        }
        const existing = this.mappingSet.metadata.curieMap.find((entry) => entry.prefix === prefix);
        if (existing && existing.iri !== iri) {
            return "This prefix already has a different base IRI. Choose another prefix.";
        }
        if (!existing) this.addCurieMapEntry(prefix, iri);
        this.arcSourcePrefix = prefix;
        this.subjectPrefix = prefix;
        return null;
    }

    clearArcTermSource() {
        if (this.subjectPrefix === this.arcSourcePrefix) this.subjectPrefix = "";
        this.arcSourcePrefix = "";
    }

    removeCurieMapEntry(index: number) {
        if (this.mappingSet.metadata.curieMap[index]?.prefix === this.arcSourcePrefix) {
            this.clearArcTermSource();
        }
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

    updatePrefixes(removedMapping: SssomMapping) {
        const prefixes = (mapping: SssomMapping) => [
            mapping.subjectId,
            mapping.objectId,
            mapping.predicateId,
            mapping.mappingJustification,
            ...(mapping.authorIds ?? []),
            ...(mapping.reviewerIds ?? []),
        ].map(extractPrefixFromObjectId);

        const removedPrefixes = new Set(prefixes(removedMapping));
        const keptPrefixes = new Set([
            ...createDefaultMappingSet().metadata.curieMap.map((entry) => entry.prefix),
            this.subjectPrefix,
            this.arcSourcePrefix,
            ...this.mappingSet.mappings.flatMap(prefixes),
        ]);

        this.mappingSet.metadata.curieMap = this.mappingSet.metadata.curieMap.filter(
            ({ prefix }) => !removedPrefixes.has(prefix) || keptPrefixes.has(prefix),
        );
    }

    removeSssomMapping(mapping: SssomMapping) {
        const mappingIndex = this.mappingSet.mappings.indexOf(mapping);
        if (mappingIndex === -1) { return; }
        this.mappingSet.mappings.splice(mappingIndex, 1);
        this.updatePrefixes(mapping);

        const ontology = this.unmappedOntologies.find((ontology) => ontology.key === mapping.subjectLabel);
        if (!ontology || this.current?.key === ontology.key ||
            this.queue.some((item) => item.key === ontology.key) ||
            this.skipped.some((item) => item.key === ontology.key)) return;

        if (!this.current) {
            this.current = ontology;
        } else {
            this.queue = [...this.queue, ontology];
        }
    }


}

export const mappingStore = new MappingStore();
