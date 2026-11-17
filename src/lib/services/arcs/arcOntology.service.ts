import type { DerivedOntology } from "$lib/stores/arcs/ArcStore.svelte";
import { isNumericValue } from "./valuePredicates";

export type ArcTermFilter = "standard" | "all" | "exclude-numeric";

export function extractOntologies(node: GraphNode, filter: ArcTermFilter = "all"): DerivedOntology[] {
  switch (filter) {
    case "standard":
      return extractStandardTerms(node);
    case "all":
      return extractAllTerms(node);
    case "exclude-numeric":
      return extractNonNumericTerms(node);
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

/** Start with all terms, then exclude numeric values while keeping names and units. */
function extractNonNumericTerms(node: GraphNode): DerivedOntology[] {
  return extractAllTerms(node).filter((term) => {
    if (term.ontologyAttribute !== "valueReference") return true;

    return !isNumericValue(term.key);
  });
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
