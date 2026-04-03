<script lang="ts">
  import { downloadJson } from "$lib/services/arcs/arcFile.service";
  import { mappingStore, type IMapping } from "$lib/stores/mapping/MappingStore.svelte";
  import { oboFileStore } from "$lib/stores/oboFiles/OboFileStore.svelte";
  import Button from "../ui/button/button.svelte";
  import Mapping from "./Mapping.svelte";
  import { ChevronRight, Download, Upload } from "lucide-svelte";

  let toggleBtn = $state(true);
  let fileInput: HTMLInputElement;

  /**
   * Import OBO Files
   * @param event
   */
  async function handleChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    const file = input.files[0];
    const mapping = await file.text();
    const mappingJson = (await JSON.parse(mapping)) as IMapping[];

    mappingStore.load(mappingJson);
  }
</script>

<input class="hidden" type="file" accept="application/json,.json" bind:this={fileInput} onchange={handleChange} />

<div class="w-full h-full">
  <div class="flex gap-2 items-center">
    <h2 class="underline py-2">Ontology Mapping (OBO-JSON)</h2>
    <Button variant={"ghost"} size={"icon"} onclick={() => (toggleBtn = !toggleBtn)}
      ><ChevronRight class={`transition-transform duration-75 ${!toggleBtn ? "rotate-90" : ""}`} /></Button
    >
    <div class="ml-auto">
      <Button variant={"outline"} class="ml-auto" onclick={() => fileInput.click()}><Upload /></Button>
      <Button variant={"outline"} class="ml-auto" onclick={() => downloadJson(mappingStore.mappingJson, "mapping.json")}><Download /></Button>
    </div>
  </div>

  {#if mappingStore.mappingJson}
    <div class="flex flex-col gap-4" class:hidden={toggleBtn}>
      {#each mappingStore.mappingJson as mapping, index (mapping.name)}
        <div class="rounded shadow py-4 px-4">
          <Mapping bind:mapping={mappingStore.mappingJson[index]} {index} />
        </div>
      {/each}
    </div>
  {/if}
</div>
