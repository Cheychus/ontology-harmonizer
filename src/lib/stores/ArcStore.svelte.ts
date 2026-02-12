import { SvelteMap } from "svelte/reactivity";

export type DerivedOntology = {
  source: GraphNode;
  value: string;
}

class ArcStore {
  filename: string = $state("");
  json: ARC_RO_JSON | null = $state(null);
  graph: GraphNode[] = $derived(this.json?.["@graph"] ?? []);
  definedOntologies: SvelteMap<string, DerivedOntology> = $state(new SvelteMap());
  undefinedOntologies: SvelteMap<string, DerivedOntology> = $state(new SvelteMap());
  ontologiesCount: number = $derived(this.definedOntologies.size + this.undefinedOntologies.size);
  initialised: boolean = $state(false);

  /**
   * Initialise this store with a arc json file
   * @param json
   */
  public init(json: ARC_RO_JSON) {
    this.json = json;
    this.extractOntologies();
    this.initialised = true;
  }

  private extractOntologies() {
    // To reset the maps after a new arc was initialised
    this.definedOntologies.clear();
    this.undefinedOntologies.clear();


    this.graph.forEach(node => {
      if (node["@type"] === "PropertyValue") {
        const ontology = this.extractOntology(node);
        if (!ontology) {
          this.undefinedOntologies.set(node.name, { source: node, value: "" });
        } else {
          this.definedOntologies.set(node.name, { source: node, value: ontology });
        }

      }
    });
    console.log(this.definedOntologies);
    console.log(this.undefinedOntologies);
  }

  /**
   * Ontologies can be saved in different attributes, so this method checks all possible values
   * and can be extended if more attributes need support
   * @param node 
   * @returns 
   */
  private extractOntology(node: GraphNode): string | null {
    if (node.propertyID) {
      return node.propertyID;
    }
    if (node.unitCode) {
      return node.unitCode;
    }

    return null;
  }

  saveOntologyValue(key: string, value: string) {
    console.log("SAVE: ", key, value);
  }

  updateArcJson() {
    this.extractOntologies(); // To detect if a undefined Ontology is now defined
    this.json = this.json; // To trigger svelte reactivity and update the json

  }

}

export const arcStore = new ArcStore();
