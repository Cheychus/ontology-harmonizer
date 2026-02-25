<script lang="ts">
  import Input from "../ui/input/input.svelte";
  import Button from "../ui/button/button.svelte";
  import { arcStore, type DerivedOntology } from "$lib/stores/ArcStore.svelte";
  import { mapStore } from "$lib/stores/MapStore.svelte";
  import { onMount } from "svelte";
  import { searchTerms } from "$lib/api/terminology";
  import { terminologyStore } from "$lib/stores/terminologyService/TerminologyStore.svelte";
  import type { ITerminologySearchResult } from "$lib/types/terminologyService";
  import { LoaderCircle, Search } from "lucide-svelte";
  import Matchings from "./Matchings.svelte";
  import { oboFileStore } from "$lib/stores/oboFiles/OboFileStore.svelte";
  import * as Select from "$lib/components/ui/select/index.js";
  import type { OboSynonym } from "$lib/types/oboFiles";

  let { i, name, ontology }: { i: number; name: string; ontology: DerivedOntology } = $props();

  let ontoName: string = $state("");
  let ontos: ITerminologySearchResult[] = $state([]);

  let loading = $state(false);
  let noResults = $state(false);

  onMount(() => {
    ontoName = name;
  });

  async function getOntos() {
    loading = true;
    noResults = false;
    const result = await searchTerms(fetch, ontoName, terminologyStore.selectedCollection?.id ?? "");
    console.log(result);

    ontos = result;
    if (result.length === 0) {
      noResults = true;
    }
    loading = false;
  }

  const selectOptions = $derived.by(() => {
    return (
      oboFileStore.oboJson?.terms.map((term) => {
        return { value: term.id, label: term.id + " - " + term.name };
      }) ?? []
    );
  });
</script>

<div class="grid grid-cols-2 gap-2 shadow text-wrap break-all p-4">
  <h3 class="col-span-2">{name}</h3>
  <Input bind:value={ontoName} />
  <Button onclick={getOntos} variant="secondary"
    >Search Ontologies <Search size={22} />
    {#if loading}<LoaderCircle class="animate-spin" />
    {/if}</Button
  >
  <div class="col-span-2">
    <Matchings ontologies={ontos} {name} />
  </div>

  {#if noResults}
    <p class="italic">No Ontologies were found. Maybe try a different search term.</p>
  {/if}
</div>
