import { SvelteMap } from "svelte/reactivity";
import { arcStore } from "./ArcStore.svelte";

class MapStore {

    ontologyMapping = new SvelteMap<string, string>();

    init() {
        this.ontologyMapping.clear();
    }

    addMapping(key: string, value: string) {
        this.ontologyMapping.set(key, value);
    }

    applyMapping(): number {
        console.log("Apply all mappings");
        let count = 0;
        this.ontologyMapping.entries().forEach((mapping) => {
            // Update both, defined and undefined ontologies 
            const onto1 = arcStore.definedOntologies.get(mapping[0]);
            const onto2 = arcStore.undefinedOntologies.get(mapping[0]);

            // Directly update the json source here, because the mapping clearly defines a value for this ontology key
            // Update only when the mapping defines another value for the key
            if (onto1 && onto1.value !== mapping[1]) {
                const attribute = onto1.ontologyAttribute;
                onto1.source[attribute] = mapping[1];
                count++;
            }
            if (onto2 && onto2.value !== mapping[1]) {
                const attribute = onto2.ontologyAttribute;
                onto2.source[attribute] = mapping[1];
                count++;
            }

            console.log(mapping, mapping[0], mapping[1]);
            console.log(arcStore.json);
        });
        arcStore.updateArcJson();

        return count;
    }


}

export const mapStore = new MapStore();