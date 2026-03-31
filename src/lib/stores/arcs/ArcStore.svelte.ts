import { extractOntologies } from "$lib/services/arcs/arcOntology.service";
import type { OboFile } from "$lib/types/oboFiles";
import { SvelteMap } from "svelte/reactivity";
import { oboFileStore } from "../oboFiles/OboFileStore.svelte";
import { curieToUrl } from "$lib/services/oboFiles/oboFile.service";
import type { IGitLabProject } from "$lib/types/gitLab";

export type DerivedOntology = {
  source: GraphNode;
  key: string;
  value: string;
  ontologyAttribute: "propertyID" | "unitCode" | "valueReference";
};

class ArcStore {
  filename: string = $state("");
  project: IGitLabProject | null = $state(null);
  json: ARC_RO_JSON | null = $state(null);
  graph: GraphNode[] = $derived(this.json?.["@graph"] ?? []);
  ontologyCandidates: SvelteMap<string, DerivedOntology> = $state(new SvelteMap());
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
    // To reset the map after a new arc was initialised
    this.ontologyCandidates.clear();

    this.graph.forEach((node) => {
      if (node["@type"] === "PropertyValue") {
        const ontologies = extractOntologies(node);
        ontologies.forEach((onto) => {
          this.ontologyCandidates.set(onto.key, onto);
        });
      }
    });
  }

  saveOntologyValue(key: string, value: string) {
    console.log("SAVE: ", key, value);
  }

  private updateArcJson() {
    this.searchOntologies(); // To detect if a undefined Ontology is now defined
    this.json = this.json; // To trigger svelte reactivity and update the json
  }

  mapOBOtoARC(): number {
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
}

export const arcStore = new ArcStore();
