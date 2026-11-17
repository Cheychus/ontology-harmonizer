import type { DerivedOntology } from "$lib/stores/arcs/ArcStore.svelte";

export interface TermOption {
  label: string;
  occurrences: DerivedOntology[];
}

export interface TermGroup {
  name: string;
  property: TermOption | null;
  units: TermOption[];
  values: TermOption[];
  valueOccurrences: number;
}

/** Keep selections separate for each property, role and label. */
export function termSelectionKey(term: DerivedOntology): string {
  return JSON.stringify([term.source.name ?? "", term.ontologyAttribute, term.key]);
}

/** Group the extracted terms by property name, preserving their original occurrences. */
export function groupArcTerms(terms: DerivedOntology[]): TermGroup[] {
  const groups = new Map<string, {
    properties: Map<string, TermOption>;
    units: Map<string, TermOption>;
    values: Map<string, TermOption>;
  }>();

  for (const term of terms) {
    const name = term.source.name ?? "";
    let group = groups.get(name);
    if (!group) {
      group = { properties: new Map(), units: new Map(), values: new Map() };
      groups.set(name, group);
    }

    let options: Map<string, TermOption>;
    switch (term.ontologyAttribute) {
      case "propertyID": options = group.properties; break;
      case "unitCode": options = group.units; break;
      case "valueReference": options = group.values; break;
    }
    const option = options.get(term.key);
    if (option) option.occurrences.push(term);
    else options.set(term.key, { label: term.key, occurrences: [term] });
  }

  return Array.from(groups, ([name, group]) => ({
    name,
    property: group.properties.values().next().value ?? null,
    units: Array.from(group.units.values()),
    values: Array.from(group.values.values()),
    valueOccurrences: Array.from(group.values.values()).reduce((sum, option) => sum + option.occurrences.length, 0),
  }));
}
