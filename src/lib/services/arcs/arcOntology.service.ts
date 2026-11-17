import type { DerivedOntology } from "$lib/stores/arcs/ArcStore.svelte";

export type ArcTermFilter = "standard" | "all";

export function extractOntologies(node: GraphNode, filter: ArcTermFilter = "standard"): DerivedOntology[] {
  switch (filter) {
    case "standard":
      return extractStandardTerms(node);
    case "all":
      return extractAllTerms(node);
  }
}

/** Include terms only when their reference attribute is present, even if empty. */
function extractStandardTerms(node: GraphNode): DerivedOntology[] {
  const terms: DerivedOntology[] = [];

  if (node.name && node.propertyID != null) {
    terms.push(createTerm(node, node.name, "propertyID"));
  }

  if (node.unitText && node.unitCode != null) {
    terms.push(createTerm(node, node.unitText, "unitCode"));
  }

  if (node.value && node.valueReference != null) {
    terms.push(createTerm(node, node.value, "valueReference"));
  }

  return terms;
}

/** Include all non-empty names, units and values, regardless of references. */
function extractAllTerms(node: GraphNode): DerivedOntology[] {
  const terms: DerivedOntology[] = [];

  if (node.name?.trim()) {
    terms.push(createTerm(node, node.name, "propertyID"));
  }

  if (node.unitText?.trim()) {
    terms.push(createTerm(node, node.unitText, "unitCode"));
  }

  if (node.value != null && String(node.value).trim()) {
    terms.push(createTerm(node, node.value, "valueReference"));
  }

  return terms;
}

/** Build the shared mapping representation without changing the ARC node. */
function createTerm(
  node: GraphNode,
  label: string | number,
  ontologyAttribute: DerivedOntology["ontologyAttribute"],
): DerivedOntology {
  const reference = node[ontologyAttribute];

  return {
    source: node,
    key: String(label),
    value: Array.isArray(reference) ? reference.join(",") : reference ?? "",
    ontologyAttribute,
  };
}
