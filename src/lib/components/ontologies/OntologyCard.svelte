<script lang="ts">
  import Input from "../ui/input/input.svelte";
  import Button from "../ui/button/button.svelte";
  import { type DerivedOntology } from "$lib/stores/ArcStore.svelte";
  import { onMount } from "svelte";
  import { searchTerms } from "$lib/api/terminology";
  import { terminologyStore } from "$lib/stores/terminologyService/TerminologyStore.svelte";
  import type { ITerminologySearchResult } from "$lib/types/terminologyService";
  import { LoaderCircle, Search } from "lucide-svelte";
  import Matchings from "./Matchings.svelte";
  import Badge from "../ui/badge/badge.svelte";

  let { ontology }: { ontology: DerivedOntology } = $props();

  let ontoName: string = $state("");
  let ontologySearchResults: ITerminologySearchResult[] = $state([]);

  let loading = $state(false);
  let noResults = $state(false);

  onMount(() => {
    ontoName = ontology.key;
  });

  async function getOntos() {
    loading = true;
    noResults = false;
    const result = await searchTerms(fetch, ontology.key, terminologyStore.selectedCollection?.id ?? "");
    console.log(result);

    ontologySearchResults = result;
    if (result.length === 0) {
      noResults = true;
    }
    loading = false;
  }
</script>

<div class="grid grid-cols-2 gap-2 shadow text-wrap break-all p-4">
  <div class="flex gap-2 items-center col-span-2">
    <h3 class="">{ontology.key}</h3>
    <Badge variant="outline" class="h-6">{ontology.ontologyAttribute}</Badge>
  </div>

  <Input bind:value={ontoName} />
  <Button onclick={getOntos} variant="secondary"
    >Search Ontologies <Search size={22} />
    {#if loading}<LoaderCircle class="animate-spin" />
    {/if}</Button
  >
  <div class="col-span-2">
    <Matchings bind:ontologies={ontologySearchResults} name={ontology.key} />
  </div>

  {#if noResults}
    <p class="italic">No Ontologies were found. Maybe try a different search term.</p>
  {/if}
</div>
