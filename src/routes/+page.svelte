<script lang="ts">
  import OntologyCard from "$lib/components/ontologies/OntologyCard.svelte";
  import { Button } from "$lib/components/ui/button/index.js";
  import { downloadJson, loadArcFile } from "$lib/services/arcs/arcFile.service";
  import { arcStore } from "$lib/stores/ArcStore.svelte";
  import { mapStore } from "$lib/stores/MapStore.svelte";
  import { onMount } from "svelte";
  import * as Collapsible from "$lib/components/ui/collapsible/index.js";
  import OboStringView from "$lib/components/mapping/OboStringView.svelte";
  import { oboFileStore } from "$lib/stores/oboFiles/OboFileStore.svelte";
  import OboMapping from "$lib/components/mapping/OboMapping.svelte";
  import Status from "$lib/components/ontologies/Status.svelte";
  import { ChevronRight, Download, Upload } from "lucide-svelte";
  import OntologyView from "$lib/components/ontologies/OntologyView.svelte";

  const ALLOWED_FORMAT = "application/json,.json";

  let fileInput: HTMLInputElement;
  let statusMessage = $state("");

  let definedToggle = $state(true),
    undefinedToggle = $state(true);

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
    arcStore.filename = file.name;
  }

  function handleSave() {}
</script>

<input class="hidden" type="file" accept={ALLOWED_FORMAT} bind:this={fileInput} onchange={handleChange} />

<div class="min-h-screen w-full max-w-full flex flex-col justify-center items-center p-8">
  <div class="flex gap-2 py-16">
    <Button class="p-6 px-16" onclick={() => fileInput.click()}>Upload ARC-RO-Crate JSON File <Upload size={22} /></Button>

    {#if arcStore.initialised}
      <Button class="p-6 px-16" variant={"secondary"} onclick={() => downloadJson(arcStore.json, "updated-arc.json")}>Export ARC-RO-Crate JSON File <Download size={22} /></Button>
    {/if}
  </div>

  <div class="py-4 w-full">
    <OboStringView />
  </div>

  <div class="py-4 w-full">
    <OboMapping />
  </div>

  <Status />
  {#if arcStore.initialised}
    <div class="w-full flex flex-col gap-2 pb-4">
      <Button
        class="max-w-96"
        onclick={() => {
          statusMessage = arcStore.mapOBOtoARC() + " Ontologies were updated";
        }}>Apply Mapping</Button
      >
    </div>
    {statusMessage}
  {/if}

  {#if arcStore.initialised}
    <div class="flex w-full flex-col">
      <OntologyView ontologies={arcStore.ontologyCandidates} />
    </div>
  {/if}
</div>
