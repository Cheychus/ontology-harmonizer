import { extractOntologies, type ArcTermFilter } from "$lib/services/arcs/arcOntology.service";
import { SvelteMap, SvelteSet } from "svelte/reactivity";
import { termSelectionKey } from "$lib/services/arcs/termGroups";
import type { IGitLabProject } from "$lib/types/gitLab";
import { mappingStore } from "../mapping/MappingStore.svelte";
import { applicationStore } from "../application/ApplicationStore.svelte";
import { getArcJson, getProject, getProjects } from "$lib/services/gitlab/gitlab";
import { failure } from "$lib/services/toasts/toastService";
import { resolveArcMapping } from "$lib/services/arcs/mappingReview";
import { curieToIri } from "$lib/services/sssom/curieMap";

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
  extractedOntologyValues: DerivedOntology[] = $state([]);
  private excludedTerms = new SvelteSet<string>();
  arcIriMap: SvelteMap<string, string[]> = $state(new SvelteMap());
  changedOntologies: IChangedOntology[] = $state([]);
  publishedResult: { commitUrl: string; mergeUrl: string } | null = $state(null);


  initialised: boolean = $state(false);
  private selectedTermFilter: ArcTermFilter = $state("all");

  get termFilter() {
    return this.selectedTermFilter;
  }

  isTermIncluded(term: DerivedOntology) {
    return !this.excludedTerms.has(termSelectionKey(term));
  }

  setTermsIncluded(terms: DerivedOntology[], included: boolean) {
    for (const term of terms) {
      const key = termSelectionKey(term);
      if (included) this.excludedTerms.delete(key);
      else this.excludedTerms.add(key);
    }
    this.updateSelectedTerms();
    mappingStore.startMapping(mappingStore.unmappedOntologies);
  }

  deselectValuesMatching(matches: (value: string) => boolean) {
    const matchingValues = this.allOntologyValues.filter((term) =>
      term.ontologyAttribute === "valueReference" && matches(term.key));
    if (matchingValues.length > 0) this.setTermsIncluded(matchingValues, false);
  }

  setTermFilter(filter: ArcTermFilter) {
    if (filter === this.selectedTermFilter) return;
    this.selectedTermFilter = filter;
    this.searchOntologies();
    mappingStore.startMapping(mappingStore.unmappedOntologies);
  }

  /**
   * Initialise this store with a arc json file
   * @param json
   */
  public init(json: ARC_RO_JSON) {
    this.json = json;
    this.selectedTermFilter = "all";
    this.excludedTerms.clear();
    this.searchOntologies();
    mappingStore.startMapping(mappingStore.unmappedOntologies);
    this.changedOntologies = [];
    this.publishedResult = null;
    this.initialised = true;
  }

  loading = $state(false);
  selecting = $state(false);
  async loadArcs() {
    if (!applicationStore.isAuthenticated) {
      failure("You need to authenticate first");
      return;
    }
    this.loading = true;
    try {
      this.projects = await getProjects();
    } catch (e) {
      if (!applicationStore.sessionExpired) failure(e instanceof Error ? e.message : "Could not load DataHUB projects");
    } finally {
      this.loading = false;
    }
  }

  async selectArc(projectId: number) {
    this.selecting = true;
    try {
      const [arcJson, project] = await Promise.all([getArcJson(projectId), getProject(projectId)]);
      if (!arcJson) throw new Error("No Arc JSON");
      this.init(arcJson);
      this.project = project;
      this.filename = project.name;
      this.arcProjectId = projectId;
      applicationStore.stepState.arcSelected = true;
      return project;
    } finally {
      this.selecting = false;
    }
  }

  private searchOntologies() {
    this.extractedOntologyValues = [];
    this.graph.forEach((node) => {
      if (node["@type"] === "PropertyValue") {
        this.extractedOntologyValues.push(...extractOntologies(node, this.termFilter));
      }
    });
    this.updateSelectedTerms();
  }

  private updateSelectedTerms() {
    this.ontologyCandidates.clear();
    this.allOntologyValues = this.extractedOntologyValues.filter((term) => this.isTermIncluded(term));
    this.arcIriMap.clear();

    const references = new Map<string, Set<string>>();
    for (const term of this.allOntologyValues) {
      this.ontologyCandidates.set(term.key, term);
      let iris = references.get(term.key);
      if (!iris) {
        iris = new Set();
        references.set(term.key, iris);
      }
      iris.add(term.value);
    }
    references.forEach((iris, key) => this.arcIriMap.set(key, Array.from(iris)));
  }

  saveOntologyValue(key: string, value: string) {
  }

  private updateArcJson() {
    this.searchOntologies(); // To detect if a undefined Ontology is now defined
    this.json = this.json; // To trigger svelte reactivity and update the json
  }

  applyMapping() {
    let count = 0;
    this.allOntologyValues?.forEach((onto) => {
      const mapping = resolveArcMapping(onto, mappingStore.mappingSet);
      if (mapping?.needsUpdate) {
        const existingIndex = this.changedOntologies.findIndex((change) =>
          change.old.source === onto.source && change.old.ontologyAttribute === onto.ontologyAttribute);
        const old = existingIndex >= 0 ? this.changedOntologies[existingIndex].old : { ...onto };
        onto.source[onto.ontologyAttribute] = mapping.targetValue;
        if (curieToIri(old.value, mappingStore.mappingSet.metadata.curieMap) === mapping.targetValue) {
          if (existingIndex >= 0) this.changedOntologies.splice(existingIndex, 1);
        } else if (existingIndex >= 0) {
          this.changedOntologies[existingIndex].new = mapping.targetValue;
        } else {
          this.changedOntologies.push({ old, new: mapping.targetValue });
        }
        count++;
      }
    });
    if (count > 0) this.publishedResult = null;
    this.updateArcJson();
    return count;
  }
}

export interface IChangedOntology {
  old: DerivedOntology;
  new: string;
}

export const arcStore = new ArcStore();
