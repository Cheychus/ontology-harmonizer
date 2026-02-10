class ArcStore {
  json: ARC_RO_JSON | null = $state(null);

  /**
   * Initialise this store with a arc json file
   * @param json
   */
  init(json: ARC_RO_JSON) {
    this.json = json;
    this.extractOntologies();
  }

  extractOntologies() {
    const ontologies = new Map<string, string>();
    this.json?.["@graph"].filter((node) => {
      if (node["@type"] === "PropertyValue") {
        ontologies.set(node.name, node?.propertyID ?? "");
      }
    });
    console.log(ontologies);
  }
}

export const arcStore = new ArcStore();
