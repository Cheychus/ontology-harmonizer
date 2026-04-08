<script lang="ts">
  import { arcStore, type DerivedOntology } from "$lib/stores/arcs/ArcStore.svelte";
  import { oboFileStore } from "$lib/stores/oboFiles/OboFileStore.svelte";
  import type { SvelteMap } from "svelte/reactivity";
  import OntologyCard from "./OntologyMapCard.svelte";
  import Badge from "../ui/badge/badge.svelte";
  import { ChevronRight } from "lucide-svelte";
  import { Button } from "../ui/button";
  import { mappingStore } from "$lib/stores/mapping/MappingStore.svelte";
  import Mapped from "./Mapped.svelte";

  let toggleMapped = $state(true),
    toggleUnmapped = $state(false);
</script>

<div class="flex gap-2 items-center">
  <h2 class="underline py-2">Mapped Ontology Values ({mappingStore.mappedOntologies.length}/{arcStore.ontologyCandidates.size})</h2>
  <Button variant={"ghost"} size={"icon"} onclick={() => (toggleMapped = !toggleMapped)}><ChevronRight class={`transition-transform duration-75 ${!toggleMapped ? "rotate-90" : ""}`} /></Button>
</div>

<div class="flex flex-col gap-2" class:hidden={toggleMapped}>
  {#each mappingStore.mappedOntologies as ontology (ontology.key)}
    <Mapped {ontology} />
  {/each}
</div>

<div class="pt-4 flex gap-2 items-center">
  <h2 class="underline py-2">Unmapped Ontology Values ({mappingStore.unmappedOntologies.length}/{arcStore.ontologyCandidates.size})</h2>
  <Button variant={"ghost"} size={"icon"} onclick={() => (toggleUnmapped = !toggleUnmapped)}><ChevronRight class={`transition-transform duration-75 ${!toggleUnmapped ? "rotate-90" : ""}`} /></Button>
  <Button variant="default" class="ml-auto">Match All</Button>
</div>

<div class="flex flex-col gap-2" class:hidden={toggleUnmapped}>
  {#each mappingStore.unmappedOntologies as ontology, i (ontology.key)}
    <OntologyCard {ontology} />
  {/each}
</div>
