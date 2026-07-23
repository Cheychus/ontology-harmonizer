<script lang="ts">
  import { arcStore, type DerivedOntology } from "$lib/stores/arcs/ArcStore.svelte";
  import { oboFileStore } from "$lib/stores/oboFiles/OboFileStore.svelte";
  import type { SvelteMap } from "svelte/reactivity";
  import OntologyMapCard from "./OntologyMapCard.svelte";
  import Badge from "../ui/badge/badge.svelte";
  import { ChevronRight } from "lucide-svelte";
  import { Button } from "../ui/button";
  import { mappingStore } from "$lib/stores/mapping/MappingStore.svelte";
  import Mapped from "./Mapped.svelte";
  import Switch from "../ui/switch/switch.svelte";
  import { settingsStore } from "$lib/stores/settings/SettingsStore.svelte";
  import FocusCard from "../mapping/FocusCard.svelte";

  let toggleMapped = $state(true),
    toggleUnmapped = $state(false);

  let unmappedCount = $derived(arcStore.ontologyCandidates.size - mappingStore.unmappedOntologies.length);

  let currentOntology: DerivedOntology | null = $derived(mappingStore.unmappedOntologies.at(0) ?? null);
  let skippedOntologies: DerivedOntology[] = $state([]);
</script>

<!-- <div class="flex gap-2 items-center">
  <h2 class="underline py-2">Mapped Ontology Values ({mappingStore.mappedOntologies.length}/{arcStore.ontologyCandidates.size})</h2>
  <Button variant={"ghost"} size={"icon"} onclick={() => (toggleMapped = !toggleMapped)}
    ><ChevronRight class={`transition-transform duration-75 ${!toggleMapped ? "rotate-90" : ""}`} /></Button
  >
</div>

<div class="flex flex-col gap-2" class:hidden={toggleMapped}>
  {#each mappingStore.mappedOntologies as ontology (ontology.key)}
    <Mapped {ontology} />
  {/each}
</div> -->

<!-- <div class="pt-4 flex gap-2 items-center">
  <h2 class="underline py-2">Unmapped Ontology Values ({mappingStore.unmappedOntologies.length}/{arcStore.ontologyCandidates.size})</h2>
  <Button variant={"ghost"} size={"icon"} onclick={() => (toggleUnmapped = !toggleUnmapped)}
    ><ChevronRight class={`transition-transform duration-75 ${!toggleUnmapped ? "rotate-90" : ""}`} /></Button
  >
  <div class="ml-auto flex gap-2 items-center">
    <p class="text-muted-foreground">Automatic Matching</p>
    <Switch bind:checked={settingsStore.automaticMatching} />
  </div>
</div> -->

<div class="h-[calc(100vh-2rem)] flex flex-col gap-4 p-4 bg-red-100" class:hidden={toggleUnmapped}>
  <h3>Current Ontology Value</h3>
  {#if currentOntology}
    <FocusCard />
  {/if}

  <h3>Queued</h3>
  <!-- {#each mappingStore.unmappedOntologies as ontology, i (ontology.key)}
    
    <OntologyMapCard {ontology} />
  {/each} -->
  <h3>Skipped</h3>
  <div>
    <h3 class="text-sm font-medium text-gray-500">Skipped</h3>
    <div class="flex flex-col gap-1">
      {#each mappingStore.skippedOntologies as ontology, i (ontology.key)}
        <div class="text-sm opacity-50 line-through">
          {ontology.key}
        </div>
      {/each}
    </div>
  </div>
</div>
