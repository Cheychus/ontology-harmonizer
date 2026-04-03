import mappingStr from "$lib/assets/mappings/mapping.json?raw";
import { iriToCurie } from "$lib/services/oboFiles/oboFile.service";
import { arcStore } from "../arcs/ArcStore.svelte";


export interface IMapping {
    name: string;
    iri: string;
    synonyms: string[];
    shortForm: string;
}


class MappingStore {
    mappingJson: IMapping[] = $state([])
    private arcOntologies = $derived(arcStore.ontologyCandidates.values().toArray());
    mappedOntologies = $derived(this.arcOntologies.filter((o) => this.findMapping(o.key)));
    unmappedOntologies = $derived(this.arcOntologies.filter((o) => mappingStore.findMapping(o.key) === null));

    constructor(mappingStr: IMapping[]) {
        // this.load(mappingStr)
    }

    load(mapping: IMapping[]) {
        console.log("Mapping json loaded: ", mapping);
        this.mappingJson = mapping;
    }

    compareMappingWithArc() {
        const newValues = [];
        const overwrites = [];
        const same = [];
        this.mappedOntologies.forEach((o) => {
            const map = this.findMapping(o.key)!;

            if (o.value === map.iri) {
                console.log("MAP Value and ARC Value are the same",)

            } else if (o.value === "") {
                console.log("No IRI in ARC for this Ontology term. New Value will be: ", map.iri)
            } else if (o.value !== map.iri) {
                console.log("MAP Value: ", map.iri, "will overwrite ARC Value: ", o.value);
            }
        })
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