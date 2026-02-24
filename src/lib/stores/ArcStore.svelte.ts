import { extractOntologies } from "$lib/services/arcs/arcOntology.service";
import type { OboFile } from "$lib/types/oboFiles";
import { SvelteMap } from "svelte/reactivity";
import { oboFileStore } from "./oboFiles/OboFileStore.svelte";
import { curieToUrl } from "$lib/services/oboFiles/oboFile.service";

export type DerivedOntology = {
  source: GraphNode;
  key: string;
  value: string;
  ontologyAttribute: "propertyID" | "unitCode" | "valueReference";
}

class ArcStore {
  filename: string = $state("");
  json: ARC_RO_JSON | null = $state(null);
  graph: GraphNode[] = $derived(this.json?.["@graph"] ?? []);
  // definedOntologies: SvelteMap<string, DerivedOntology> = $state(new SvelteMap());
  //  undefinedOntologies: SvelteMap<string, DerivedOntology> = $state(new SvelteMap());

  ontologyCandidates: SvelteMap<string, DerivedOntology> = $state(new SvelteMap());

  // ontologiesCount: number = $derived(this.definedOntologies.size + this.undefinedOntologies.size);
  initialised: boolean = $state(false);

  /**
   * Initialise this store with a arc json file
   * @param json
   */
  public init(json: ARC_RO_JSON) {
    this.json = json;
    this.searchOntologies();
    this.initialised = true;
  }

  private searchOntologies() {
    // To reset the maps after a new arc was initialised
    // this.definedOntologies.clear();
    // this.undefinedOntologies.clear();
    this.ontologyCandidates.clear();


    this.graph.forEach(node => {
      if (node["@type"] === "PropertyValue") {

        const ontologies = extractOntologies(node);
        ontologies.forEach((onto) => {
          // if (onto.value === "") {
          //   this.undefinedOntologies.set(onto.key, onto);
          // } else {
          //   this.definedOntologies.set(onto.key, onto);
          // }
          this.ontologyCandidates.set(onto.key, onto);
        });
      }
    });
    // console.log(this.definedOntologies);
    // console.log(this.undefinedOntologies);
  }

  saveOntologyValue(key: string, value: string) {
    console.log("SAVE: ", key, value);
  }

  private updateArcJson() {
    this.searchOntologies(); // To detect if a undefined Ontology is now defined
    this.json = this.json; // To trigger svelte reactivity and update the json
  }

  mapOBOtoARC() {
    let count = 0;
    this.ontologyCandidates.forEach((onto) => {
      const term = oboFileStore.findTermByName(onto.key);
      if (term) {
        onto.source[onto.ontologyAttribute] = term.xrefs.map((xref) => curieToUrl(xref)).join(", ");
        count++;
      }
    });
    this.updateArcJson();
    return count;
  }

  // applyMapping(oboJson: OboFile) {
  //   let count = 0;
  //   oboJson.terms.forEach((term) => {
  //     let onto = this.ontologyCandidates.get(term.name);
  //     if (!onto) {
  //       for (const syn of term.synonyms) {
  //         onto = this.ontologyCandidates.get(syn.synonymText);
  //         if (onto) {
  //           console.log("mapping found in synonyms: ", onto, syn.synonymText);
  //           break;
  //         }
  //       }
  //     }
  //     if (onto) {
  //       onto.source[onto.ontologyAttribute] = term.xrefs.join(",");
  //       count++;
  //     }
  //   });
  //   this.updateArcJson();
  //   return count;
  // }

}

export const arcStore = new ArcStore();
