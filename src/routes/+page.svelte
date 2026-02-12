<script lang="ts">
  import OntologyCard from "$lib/components/Ontologies/OntologyCard.svelte";
  import { Button } from "$lib/components/ui/button/index.js";
  import Input from "$lib/components/ui/input/input.svelte";
  import { downloadJson, loadArcFile } from "$lib/services/fileService";
  import { arcStore } from "$lib/stores/ArcStore.svelte";
  import { mapStore } from "$lib/stores/MapStore.svelte";
  import { onMount } from "svelte";

  const ALLOWED_FORMAT = "application/json,.json";

  let fileInput: HTMLInputElement;
  let fileName = $state("");
  let statusMessage = $state("");

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

  $inspect(mapStore.ontologyMapping);
</script>

<div class="min-h-screen w-full max-w-full flex flex-col justify-center items-center p-8">
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

      <h2 class="text-2xl font-bold underline py-4">Defined Ontologies ({arcStore.definedOntologies.size}/{arcStore.ontologiesCount})</h2>
      <div class="flex flex-col gap-2">
        {#each arcStore.definedOntologies as ontology, i}
          <OntologyCard {i} name={ontology[0]} ontology={ontology[1]} />
        {/each}
      </div>

      <h2 class="text-2xl font-bold underline py-4">Undefined Ontologies ({arcStore.undefinedOntologies.size}/{arcStore.ontologiesCount})</h2>
      <div class="flex flex-col gap-2">
        {#each arcStore.undefinedOntologies as ontology, i}
          <OntologyCard {i} name={ontology[0]} ontology={ontology[1]} />
        {/each}
      </div>
    </div>
  {/if}
</div>
