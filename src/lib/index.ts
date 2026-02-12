// place files you want to import through the `$lib` alias in this folder.

interface ARC_RO_JSON {
  "@context": Array<unknown>;
  "@graph": Array<GraphNode>;
}

interface GraphNode {
  "@id": string;
  "@type": string;
  additionalType?: string;
  name: string;
  termCode?: string;
  // This is were the ontologies could be saved
  propertyID?: string;
  unitCode?: string;
}
