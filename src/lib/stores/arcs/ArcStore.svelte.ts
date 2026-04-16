import { extractOntologies } from "$lib/services/arcs/arcOntology.service";
import type { OboFile } from "$lib/types/oboFiles";
import { SvelteMap } from "svelte/reactivity";
import { oboFileStore } from "../oboFiles/OboFileStore.svelte";
import { curieToUrl } from "$lib/services/oboFiles/oboFile.service";
import type { IGitLabProject } from "$lib/types/gitLab";
import { mappingStore } from "../mapping/MappingStore.svelte";
import { applicationStore } from "../application/ApplicationStore.svelte";
import { getProjects } from "$lib/services/gitlab/gitlab";
import { failure, warning } from "$lib/services/toasts/toastService";

export type DerivedOntology = {
  source: GraphNode;
  key: string;
  value: string;
  ontologyAttribute: "propertyID" | "unitCode" | "valueReference";
};

class ArcStore {
  filename: string = $state("");
  project: IGitLabProject | null = $state(null);
  arcProjectId: number | null = $state(null);
  projects: IGitLabProject[] = $state([]);
  privateProjects = $derived(this.projects.filter((p) => p.visibility === "private"));
  publicProjects = $derived(this.projects.filter((p) => p.visibility === "public"));

  json: ARC_RO_JSON | null = $state(null);
  graph: GraphNode[] = $derived(this.json?.["@graph"] ?? []);

  ontologyCandidates: SvelteMap<string, DerivedOntology> = $state(new SvelteMap());
  allOntologyValues: DerivedOntology[] = $state([]);
  arcIriMap: SvelteMap<string, string[]> = $state(new SvelteMap());

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

  loading = $state(false);
  async loadArcs() {
    if (!applicationStore.isAuthenticated) {
      failure("You need to authenticate first");
      return;
    }
    this.loading = true;
    try {
      this.projects = await getProjects();
    } catch (e) {
      console.log("Error: ", e);
    } finally {
      this.loading = false;
    }
  }

  private searchOntologies() {
    // To reset the map after a new arc was initialised
    this.ontologyCandidates.clear();
    this.allOntologyValues = [];
    this.arcIriMap.clear();

    this.graph.forEach((node) => {
      if (node["@type"] === "PropertyValue") {
        const ontologies = extractOntologies(node);
        this.allOntologyValues.push(...ontologies);
        ontologies.forEach((onto) => {
          this.ontologyCandidates.set(onto.key, onto);
        });
      }
    });

    this.ontologyCandidates.forEach((o) => this.filterDuplicateIris(o.key))
    console.log(this)
  }

  private filterDuplicateIris(ontologyKey: string) {
    const arcOccurences = this.allOntologyValues.filter((o) => o.key === ontologyKey);
    const iris = new Set<string>();
    arcOccurences.forEach((o) => iris.add(o.value));
    this.arcIriMap.set(ontologyKey, iris.values().toArray()) // key = IRI1, IRI2...

    return iris;
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

  changedOntologies: IChangedOntology[] = [];
  applyMapping() {
    let count = 0;
    this.allOntologyValues?.forEach((onto) => {
      const mapping = mappingStore.findMapping(onto.key);
      if (mapping && mapping.iri !== onto.value) {
        onto.source[onto.ontologyAttribute] = mapping.iri; // change in ARC JSON
        // onto.value = mapping.iri; // change in store
        this.changedOntologies.push({
          old: onto,
          new: mapping.iri,
        })
        count++;
      }
    });
    this.init(this.json!)
    console.log(count);
    return count;
  }
}

export interface IChangedOntology {
  old: DerivedOntology;
  new: string;
}

export const arcStore = new ArcStore();
