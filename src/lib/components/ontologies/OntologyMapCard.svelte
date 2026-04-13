<script lang="ts">
  import Input from "../ui/input/input.svelte";
  import Button from "../ui/button/button.svelte";
  import { type DerivedOntology } from "$lib/stores/arcs/ArcStore.svelte";
  import { onMount } from "svelte";
  import { searchTerms } from "$lib/api/terminology";
  import { terminologyStore } from "$lib/stores/terminologyService/TerminologyStore.svelte";
  import type { ITerminologySearchResult } from "$lib/types/terminologyService";
  import { LoaderCircle, Search } from "lucide-svelte";
  import Matchings, { type IMatchingViewModel } from "./Matchings.svelte";
  import Badge from "../ui/badge/badge.svelte";
  import { matchingStore, type IMatchingServiceData } from "$lib/stores/pythonService/MatchingStore.svelte";

  import { settingsStore } from "$lib/stores/settings/SettingsStore.svelte";

  let { ontology }: { ontology: DerivedOntology } = $props();

  let searchInput: string = $state("");
  let ontologySearchResults: IMatchingViewModel[] = $state([]);

  let loading = $state(false);
  let noResults = $state(false);

  onMount(() => {
    searchInput = ontology.key;
  });

  $effect(() => {
    if (settingsStore.automaticMatching) {
      getMatchings("pythonService");
    }
  });

  $inspect(settingsStore.automaticMatching);

  export type matchingType = "terminology" | "pythonService";

  function fromTerminology(result: ITerminologySearchResult): IMatchingViewModel {
    return {
      iri: result.iri,
      label: result.label,
      description: result.descriptions,
      shortForm: result.short_form,
      source: "terminology",
    };
  }

  function fromMatchingService(result: IMatchingServiceData): IMatchingViewModel {
    return {
      iri: result.id,
      label: result.label,
      description: result.definition,
      shortForm: result.short_id,
      rank: result.rank,
      score: result.score,
      source: "pythonService",
    };
  }

  async function getMatchings(method: matchingType) {
    loading = true;
    noResults = false;

    if (method === "terminology") {
      const result = (await searchTerms(fetch, searchInput, terminologyStore.selectedCollection?.id ?? "")) as ITerminologySearchResult[];
      ontologySearchResults = result.map((r) => fromTerminology(r));
    } else if (method === "pythonService") {
      const result = await matchingStore.query(searchInput);
      ontologySearchResults = result.map((r) => fromMatchingService(r));
    }

    if (ontologySearchResults.length === 0) {
      noResults = true;
    }
    loading = false;
  }

  export function matchAll() {
    console.log("match all");
  }
</script>

<div class="grid grid-cols-2 gap-2 shadow text-wrap break-all p-4">
  <div class="flex gap-2 items-center col-span-2">
    <h3 class="">{ontology.key}</h3>
    <Badge variant="outline" class="h-6">{ontology.ontologyAttribute}</Badge>
    {#if ontology.value !== ""}
      <Badge variant="outline" class="h-6">{ontology.value}</Badge>
    {:else}
      <Badge variant="outline" class="h-6 ml-auto">ARC Value not defined</Badge>
    {/if}
  </div>

  <Input bind:value={searchInput} />
  <div class="flex gap-2">
    <Button class="flex-1" onclick={() => getMatchings("terminology")} variant="secondary"
      >Search Ontologies <Search size={22} />
      {#if loading}<LoaderCircle class="animate-spin" />
      {/if}</Button
    >
    <Button onclick={async () => getMatchings("pythonService")} variant="secondary">Python Service</Button>
  </div>

  <div class="col-span-2">
    <Matchings bind:searchResults={ontologySearchResults} arcOntologyName={ontology.key} />
  </div>

  {#if noResults}
    <p class="italic">No Ontologies were found. Maybe try a different search term.</p>
  {/if}
</div>
