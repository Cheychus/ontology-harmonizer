<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import { downloadJson, loadArcFile } from "$lib/services/arcs/arcFile.service";
  import { arcStore } from "$lib/stores/arcs/ArcStore.svelte";
  import OboStringView from "$lib/components/mapping/OboStringView.svelte";
  import OboMapping from "$lib/components/mapping/OboMapping.svelte";
  import Status from "$lib/components/ontologies/Status.svelte";
  import { BoxSelect, Download, Gitlab, Pointer, Upload } from "lucide-svelte";
  import OntologyView from "$lib/components/ontologies/OntologyView.svelte";
  import { ARC } from "@nfdi4plants/arctrl";
  import { pushToGitlab } from "$lib/services/arcs/arctrl";

  let fileInput: HTMLInputElement;
  let statusMessage = $state("");

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
    const arcJson = JSON.stringify(arcStore.json);
    let arc = ARC.fromROCrateJsonString(arcJson);

    console.log(arc);
  }
</script>

<input class="hidden" type="file" accept="application/json,.json" bind:this={fileInput} onchange={handleChange} />

<div class="pt-32 w-full max-w-full flex flex-col justify-center items-center">
  <div class="flex gap-2 justify-start w-full">
    <Button class="p-6 px-16" variant="default" href="./select-arc">
      <svg class="h-4 w-4 fill-orange-500" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
        ><title>GitLab</title><path
          d="m23.6004 9.5927-.0337-.0862L20.3.9814a.851.851 0 0 0-.3362-.405.8748.8748 0 0 0-.9997.0539.8748.8748 0 0 0-.29.4399l-2.2055 6.748H7.5375l-2.2057-6.748a.8573.8573 0 0 0-.29-.4412.8748.8748 0 0 0-.9997-.0537.8585.8585 0 0 0-.3362.4049L.4332 9.5015l-.0325.0862a6.0657 6.0657 0 0 0 2.0119 7.0105l.0113.0087.03.0213 4.976 3.7264 2.462 1.8633 1.4995 1.1321a1.0085 1.0085 0 0 0 1.2197 0l1.4995-1.1321 2.4619-1.8633 5.006-3.7489.0125-.01a6.0682 6.0682 0 0 0 2.0094-7.003z"
        /></svg
      >
      Select ARC from Gitlab Instance</Button
    >
    <Button class="p-6" variant="outline" onclick={() => fileInput.click()}>Upload ARC-RO-Crate JSON File <Upload size={22} /></Button>

    {#if arcStore.initialised}
      <Button class="p-6" variant={"secondary"} onclick={() => downloadJson(arcStore.json, "updated-arc.json")}>Export ARC-RO-Crate JSON File <Download size={22} /></Button>
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
    <div class="w-full flex gap-2">
      <Button
        class="w-96"
        onclick={() => {
          statusMessage = arcStore.mapOBOtoARC() + " Ontologies were updated";
        }}>Apply Mapping</Button
      >
      <Button onclick={() => pushToGitlab()} class="w-64" variant="outline">Push to Gitlab</Button>
    </div>
  {/if}

  {#if arcStore.initialised}
    <div class="flex w-full flex-col">
      <OntologyView ontologies={arcStore.ontologyCandidates} />
    </div>
  {/if}
</div>
