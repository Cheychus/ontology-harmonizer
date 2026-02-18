<script lang="ts">
  import OntologyCard from "$lib/components/ontologies/OntologyCard.svelte";
  import { Button } from "$lib/components/ui/button/index.js";
  import Input from "$lib/components/ui/input/input.svelte";
  import { downloadJson, loadArcFile } from "$lib/services/arcs/arcFile.service";
  import { arcStore } from "$lib/stores/ArcStore.svelte";
  import { mapStore } from "$lib/stores/MapStore.svelte";
  import { onMount } from "svelte";
  import * as Collapsible from "$lib/components/ui/collapsible/index.js";
  import { addTerm, downloadObo, getNextId, OboParseError, parseOntologyFile, writeOntologyFile } from "$lib/services/oboFiles/oboFile.service";
  import ontoFile from "$lib/assets/mappings/mapping.obo?raw";
  import Mapping from "$lib/components/mapping/Mapping.svelte";
  import type { OboFile, OboSynonym } from "$lib/types/oboFiles";

  const ALLOWED_FORMAT = "application/json,.json";

  let fileInput: HTMLInputElement;
  let fileName = $state("");
  let statusMessage = $state("");
  let oboFile: string = $state("");

  onMount(() => {
    mapStore.init();
  });

  /**
   * Import JSON Files
   * @param event
   */
  async function handleChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    const file = input.files[0];

    await loadArcFile(file);
    fileName = file.name;
  }

  function handleSave() {}
</script>

<div class="min-h-screen w-full max-w-full flex flex-col justify-center items-center p-8">
  <Mapping oboFile={ontoFile} />
  <div class="flex gap-2">
    <Button class="p-6" onclick={() => fileInput.click()}>Upload ARC-RO-Crate JSON File</Button>
    {#if arcStore.initialised}
      <Button class="p-6" variant={"secondary"} onclick={() => downloadJson(arcStore.json, "updated-arc.json")}>Export ARC-RO-Crate JSON File</Button>
    {/if}
  </div>

  <input class="hidden" type="file" accept={ALLOWED_FORMAT} bind:this={fileInput} onchange={handleChange} />
  {#if arcStore.initialised}
    <div class="flex w-full flex-col gap-2 py-4 font-bold">
      <h2 class="text-3xl">Status:</h2>
      <p>Filename: {fileName}</p>
      <p class="">{arcStore.ontologiesCount} Ontologies were found</p>
      <p class="">{arcStore.definedOntologies.size} Ontologies are defined</p>
      <p class="">{arcStore.undefinedOntologies.size} Ontologies are not defined</p>
      <p class="text-green-400">{statusMessage}</p>
    </div>

    <div class="flex w-full flex-col">
      <div class="flex items-center gap-2">
        <h2 class="text-2xl font-bold underline py-4">Mapping</h2>
        <Button variant="ghost" size="icon-lg" onclick={() => mapStore.init()}>GET</Button>
      </div>

      <div class="flex flex-col gap-2">
        {#each mapStore.ontologyMapping as mapping, i}
          <div class="grid grid-cols-2 gap-2 shadow text-wrap break-all p-4">
            <p>{i} - {mapping[0]}</p>
            <div class="text-wrap">{mapping[1]}</div>
          </div>
        {/each}

        <Button
          class="max-w-96"
          onclick={() => {
            statusMessage = mapStore.applyMapping() + " Ontologies were updated";
          }}>Apply Mapping</Button
        >
      </div>

      <Collapsible.Root>
        <Collapsible.Trigger>
          <div class="flex gap-2 items-center">
            <h2 class="text-2xl font-bold underline py-4">Defined Ontologies ({arcStore.definedOntologies.size}/{arcStore.ontologiesCount})</h2>
            <Button variant={"ghost"}
              ><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
              </svg></Button
            >
          </div>
        </Collapsible.Trigger>

        <Collapsible.Content>
          <div class="flex flex-col gap-2">
            {#each arcStore.definedOntologies as ontology, i}
              <OntologyCard {i} name={ontology[0]} ontology={ontology[1]} />
            {/each}
          </div></Collapsible.Content
        >
      </Collapsible.Root>

      <Collapsible.Root open={true}>
        <Collapsible.Trigger>
          <div class="flex gap-2 items-center">
            <h2 class="text-2xl font-bold underline py-4">Undefined Ontologies ({arcStore.undefinedOntologies.size}/{arcStore.ontologiesCount})</h2>
            <Button variant={"ghost"}
              ><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
              </svg></Button
            >
          </div>
        </Collapsible.Trigger>

        <Collapsible.Content>
          <div class="flex flex-col gap-2">
            {#each arcStore.undefinedOntologies as ontology, i}
              <OntologyCard {i} name={ontology[0]} ontology={ontology[1]} />
            {/each}
          </div></Collapsible.Content
        >
      </Collapsible.Root>
    </div>
  {/if}
</div>
