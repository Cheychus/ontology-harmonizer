import { SvelteMap } from "svelte/reactivity";
import { arcStore } from "./ArcStore.svelte";

class MapStore {

    ontologyMapping = new SvelteMap<string, string>();

    init() {
        this.ontologyMapping.clear();
        this.ontologyMapping.set("Organism", "http://purl.org/net/orth#Organism");
        this.ontologyMapping.set("Column", "http://purl.obolibrary.org/obo/AGRO_00000420")
        this.ontologyMapping.set("FindMe", "I found you!");
    }

    addMapping(key: string, value: string) {
        this.ontologyMapping.set(key, value);
    }

    applyMapping(): number {
        console.log("Apply all mappings");
        let count = 0;
        this.ontologyMapping.entries().forEach((mapping) => {
            const onto1 = arcStore.definedOntologies.get(mapping[0]);
            const onto2 = arcStore.undefinedOntologies.get(mapping[0]);

            // Directly update the json source here, because the mapping clearly defines a value for this ontology key
            if (onto1) {
                onto1.source.propertyID = mapping[1];
                count++;
            }
            if (onto2) {
                onto2.source.propertyID = mapping[1];
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