import mappingStr from "$lib/assets/mappings/mapping.json?raw";
import { arcStore, type DerivedOntology } from "../arcs/ArcStore.svelte";
import type { MappingSet, ParsedSssomDocument, SssomMapping } from "$lib/types/mapping";
import { warning } from "$lib/services/toasts/toastService";


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
    mappingSet: MappingSet = $state(this.createDefaultMappingSet());
    subjectIdentifier = $state(this.createDefaultSubjectIdentifier());
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
        this.mappingSet = this.createDefaultMappingSet();
        this.subjectIdentifier = this.createDefaultSubjectIdentifier();
        this.importedSssom = null;
        this.startMapping(this.unmappedOntologies)
    }

    load(mapping: IMapping[]) {
        this.mappingJson = mapping;
        this.hasMappingSet = true;
        this.mappingSet = this.createDefaultMappingSet();
        this.subjectIdentifier = this.createDefaultSubjectIdentifier();
        this.importedSssom = null;
        this.startMapping(this.unmappedOntologies);
    }

    createMappingSet() {
        this.fileName = "";
        this.mappingJson = [];
        this.hasMappingSet = true;
        this.mappingSet = this.createDefaultMappingSet();
        this.subjectIdentifier = this.createDefaultSubjectIdentifier();
        this.importedSssom = null;
        this.startMapping(this.unmappedOntologies);
    }

    loadSssom(sssom: ParsedSssomDocument) {
        const defaults = this.createDefaultMappingSet();
        const curieMap = sssom.curie_map
            ? Object.entries(sssom.curie_map as Record<string, string>).map(([prefix, iri]) => ({ prefix, iri }))
            : [];
        const subjectSource = (sssom.subject_source as string | undefined) ?? "";

        this.mappingJson = [];
        this.hasMappingSet = true;
        this.importedSssom = sssom;
        this.mappingSet = {
            ...defaults,
            metadata: {
                ...defaults.metadata,
                mappingSetId: sssom.mapping_set_id as string,
                license: sssom.license as string,
                curieMap,
                title: (sssom.mapping_set_title as string | undefined) ?? "",
                description: (sssom.mapping_set_description as string | undefined) ?? "",
                version: (sssom.mapping_set_version as string | undefined) ?? "",
                comment: (sssom.comment as string | undefined) ?? "",
                subjectSource,
            },
        };
        this.subjectIdentifier = this.inferSubjectIdentifier(subjectSource, curieMap);
        this.startMapping(this.unmappedOntologies);
        console.log(sssom)
    }

    addCurieMapEntry(prefix: string, iri: string) {
        if (!prefix || !iri || this.mappingSet.metadata.curieMap.some((entry) => entry.prefix === prefix)) {
            return false;
        }

        this.mappingSet.metadata.curieMap.push({ prefix, iri });
        return true;
    }

    removeCurieMapEntry(index: number) {
        this.mappingSet.metadata.curieMap.splice(index, 1);
    }

    setSubjectIdentifier(prefix: string, uri: string) {
        const previousPrefix = this.subjectIdentifier.prefix;

        if (previousPrefix && previousPrefix !== prefix) {
            this.mappingSet.metadata.curieMap = this.mappingSet.metadata.curieMap.filter((entry) => entry.prefix !== previousPrefix);
        }

        this.subjectIdentifier = { prefix, uri };

        if (!prefix || !uri) return;

        const curieMapEntry = this.mappingSet.metadata.curieMap.find((entry) => entry.prefix === prefix);
        if (curieMapEntry) {
            curieMapEntry.iri = uri;
        } else {
            this.mappingSet.metadata.curieMap.push({ prefix, iri: uri });
        }
    }

    setSubjectSource(subjectSource: string) {
        this.mappingSet.metadata.subjectSource = subjectSource;
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

    private createDefaultMappingSet(): MappingSet {
        return {
            formatVersion: "1.0",
            metadata: {
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
            },
            mappings: [],
        };
    }

    private createDefaultSubjectIdentifier() {
        return {
            prefix: "EDAL",
            uri: "",
        };
    }

    private inferSubjectIdentifier(subjectSource: string, curieMap: MappingSet["metadata"]["curieMap"]) {
        const curieEntry = curieMap.find((entry) => subjectSource.startsWith(`${entry.prefix}:`));
        if (curieEntry) {
            return { prefix: curieEntry.prefix, uri: curieEntry.iri };
        }

        const iriEntry = curieMap
            .filter((entry) => subjectSource.startsWith(entry.iri))
            .sort((left, right) => right.iri.length - left.iri.length)[0];

        return iriEntry ? { prefix: iriEntry.prefix, uri: iriEntry.iri } : { prefix: "", uri: "" };
    }

}

export const mappingStore = new MappingStore();
