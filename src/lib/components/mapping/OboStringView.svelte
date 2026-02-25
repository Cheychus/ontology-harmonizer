<script lang="ts">
  import { downloadObo } from "$lib/services/oboFiles/oboFile.service";
  import { oboFileStore } from "$lib/stores/oboFiles/OboFileStore.svelte";
  import { ChevronRight, Download, Upload } from "lucide-svelte";
  import Button from "../ui/button/button.svelte";

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
    const oboString = await file.text();

    oboFileStore.load(oboString);
  }
</script>

<input class="hidden" type="file" accept=".obo" bind:this={fileInput} onchange={handleChange} />

<div class="flex gap-2 items-center">
  <h2 class="underline py-2">Ontology Mapping (OBO File)</h2>
  <Button variant={"ghost"} size={"icon"} onclick={() => (toggleBtn = !toggleBtn)}>
    <ChevronRight class={`transition-transform duration-75 ${!toggleBtn ? "rotate-90" : ""}`} />
  </Button>
  <div class="ml-auto">
    <Button variant={"outline"} class="ml-auto" onclick={() => fileInput.click()}><Upload /></Button>
    <Button variant={"outline"} class="ml-auto" onclick={() => downloadObo(oboFileStore.rawOboString)}><Download /></Button>
  </div>
</div>

<div class="shadow rounded w-full h-full p-4" class:hidden={toggleBtn}>
  <textarea rows="16" disabled class="w-full h-full resize-none">{oboFileStore.rawOboString}</textarea>
</div>
