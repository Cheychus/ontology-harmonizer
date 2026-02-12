class ArcStore {
  filename: string = $state("");
  json: ARC_RO_JSON | null = $state(null);
  graph: GraphNode[] = $state([]);
  definedOntologies: Map<string, string> = $state(new Map());
  undefinedOntologies: Map<string, string> = $state(new Map());
  initialised: boolean = $state(false);

  /**
   * Initialise this store with a arc json file
   * @param json
   */
  public init(json: ARC_RO_JSON) {
    this.json = json;
    this.graph = json["@graph"] ?? [];
    this.extractOntologies();
    this.initialised = true;
  }

  private extractOntologies() {
    // To reset the maps after a new arc was initialised
    this.definedOntologies = new Map();
    this.undefinedOntologies = new Map();


    this.graph.forEach(node => {
      if (node["@type"] === "PropertyValue") {
        const ontology = this.extractOntology(node);
        if (!ontology) {
          this.undefinedOntologies.set(node.name, "undefined");
        } else {
          this.definedOntologies.set(node.name, ontology);
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

}

export const arcStore = new ArcStore();
