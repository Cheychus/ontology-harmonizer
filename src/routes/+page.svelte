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

  const ALLOWED_FORMAT = "application/json,.json";

  let fileInput: HTMLInputElement;
  let fileName = $state("");
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
    fileName = file.name;
  }

  function handleSave() {}
</script>

<div class="min-h-screen w-full max-w-full flex flex-col justify-center items-center p-8">
  <div class="flex gap-2 py-16">
    <Button class="p-6 px-16" onclick={() => fileInput.click()}>Upload ARC-RO-Crate JSON File <Upload size={22} /></Button>

    {#if arcStore.initialised}
      <Button class="p-6 px-16" variant={"secondary"} onclick={() => downloadJson(arcStore.json, "updated-arc.json")}
        >Export ARC-RO-Crate JSON File <Download size={22} /></Button
      >
    {/if}
  </div>

  <div class="py-4 w-full">
    <OboStringView />
  </div>

  <div class="py-4 w-full">
    <OboMapping />
  </div>

  <Status bind:fileName bind:statusMessage />
  {#if arcStore.initialised}
    <div class="w-full flex flex-col gap-2 pb-4">
      <Button
        class="max-w-96"
        onclick={() => {
          statusMessage = arcStore.applyMapping(oboFileStore.oboJson!) + " Ontologies were updated";
        }}>Apply Mapping</Button
      >
    </div>
  {/if}

  <input class="hidden" type="file" accept={ALLOWED_FORMAT} bind:this={fileInput} onchange={handleChange} />
  {#if arcStore.initialised}
    <div class="flex w-full flex-col">
      <Collapsible.Root bind:open={definedToggle}>
        <Collapsible.Trigger>
          <div class="flex gap-2 items-center">
            <h2 class="underline py-4">Defined Ontologies ({arcStore.definedOntologies.size}/{arcStore.ontologiesCount})</h2>
            <Button variant={"ghost"} size={"icon"}
              ><ChevronRight class={`transition-transform duration-75 ${definedToggle ? "rotate-90" : ""}`} />
            </Button>
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

      <Collapsible.Root bind:open={undefinedToggle}>
        <Collapsible.Trigger>
          <div class="flex gap-2 items-center">
            <h2 class="underline py-4">Undefined Ontologies ({arcStore.undefinedOntologies.size}/{arcStore.ontologiesCount})</h2>
            <Button variant={"ghost"} size={"icon"}
              ><ChevronRight class={`transition-transform duration-75 ${undefinedToggle ? "rotate-90" : ""}`} />
            </Button>
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
