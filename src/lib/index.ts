// place files you want to import through the `$lib` alias in this folder.

interface ARC_RO_JSON {
  "@context": Array<unknown>;
  "@graph": Array<GraphNode>;
}

interface GraphNode {
  "@id": string;
  "@type": string;
  additionalType?: string;

  // This is were the ontologies are saved
  name: string; // Key name
  propertyID?: string; // SHOULD be present (URL) - Key ontology reference
  unitText?: string; // Unit name
  unitCode?: string; // COULD be present (URL) - Unit ontology reference
  value?: string; // Value text or number
  valueReference?: string; // COULD be present (URL) - Value ontology reference
}


