<script lang="ts">
  import type { DerivedOntology } from "$lib/stores/ArcStore.svelte";
  import { oboFileStore } from "$lib/stores/oboFiles/OboFileStore.svelte";
  import type { SvelteMap } from "svelte/reactivity";
  import OntologyCard from "./OntologyCard.svelte";
  import Badge from "../ui/badge/badge.svelte";

  interface Props {
    ontologies: SvelteMap<string, DerivedOntology>;
  }

  let { ontologies }: Props = $props();

  let derivedOntos = $derived(ontologies.values().toArray());
  let mappedOntos = $derived(derivedOntos.filter((onto) => oboFileStore.findTermByName(onto.key)));
  let unmappedOntos = $derived(derivedOntos.filter((onto) => oboFileStore.findTermByName(onto.key) === null));
</script>

<h2 class="underline py-2">Mapped Ontology Values ({mappedOntos.length})</h2>
<div class="flex flex-col gap-2">
  {#each mappedOntos as ontology (ontology.key)}
    <div class="shadow p-2">
      <div class="flex gap-2 items-center col-span-2">
        <h3 class="">{ontology.key}</h3>
        <Badge variant="outline" class="h-6">{ontology.ontologyAttribute}</Badge>
      </div>
      <p>ARC Value: {ontology.value}</p>
      <p>OBO ID: {oboFileStore.findTermByName(ontology.key)?.id}</p>
      <p>OBO xrefs: {oboFileStore.findTermByName(ontology.key)?.xrefs.join(", ")}</p>
    </div>
  {/each}
</div>

<div class="flex gap-4 items-center">
  <h2 class="underline py-2">Unmapped Ontology Values ({unmappedOntos.length})</h2>
</div>

<div class="flex flex-col gap-2">
  {#each unmappedOntos as ontology, i (ontology.key)}
    <OntologyCard {ontology} />
  {/each}
</div>
