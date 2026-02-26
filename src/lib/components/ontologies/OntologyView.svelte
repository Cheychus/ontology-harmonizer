<script lang="ts">
  import { arcStore, type DerivedOntology } from "$lib/stores/arcs/ArcStore.svelte";
  import { oboFileStore } from "$lib/stores/oboFiles/OboFileStore.svelte";
  import type { SvelteMap } from "svelte/reactivity";
  import OntologyCard from "./OntologyMapCard.svelte";
  import Badge from "../ui/badge/badge.svelte";
  import { ChevronRight } from "lucide-svelte";
  import { Button } from "../ui/button";

  interface Props {
    ontologies: SvelteMap<string, DerivedOntology>;
  }

  let { ontologies }: Props = $props();

  let derivedOntos = $derived(ontologies.values().toArray());
  let mappedOntos = $derived(derivedOntos.filter((onto) => oboFileStore.findTermByName(onto.key)));
  let unmappedOntos = $derived(derivedOntos.filter((onto) => oboFileStore.findTermByName(onto.key) === null));
  let toggleMapped = $state(true),
    toggleUnmapped = $state(false);
</script>

<div class="flex gap-2 items-center">
  <h2 class="underline py-2">Mapped Ontology Values ({mappedOntos.length}/{arcStore.ontologyCandidates.size})</h2>
  <Button variant={"ghost"} size={"icon"} onclick={() => (toggleMapped = !toggleMapped)}
    ><ChevronRight class={`transition-transform duration-75 ${!toggleMapped ? "rotate-90" : ""}`} /></Button
  >
</div>

<div class="flex flex-col gap-2" class:hidden={toggleMapped}>
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

<div class="flex gap-2 items-center">
  <h2 class="underline py-2">Unmapped Ontology Values ({unmappedOntos.length}/{arcStore.ontologyCandidates.size})</h2>
  <Button variant={"ghost"} size={"icon"} onclick={() => (toggleUnmapped = !toggleUnmapped)}
    ><ChevronRight class={`transition-transform duration-75 ${!toggleUnmapped ? "rotate-90" : ""}`} /></Button
  >
</div>

<div class="flex flex-col gap-2" class:hidden={toggleUnmapped}>
  {#each unmappedOntos as ontology, i (ontology.key)}
    <OntologyCard {ontology} />
  {/each}
</div>
