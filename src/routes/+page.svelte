<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import { loadArcFile } from "$lib/services/fileService";
  import { arcStore } from "$lib/stores/ArcStore.svelte";

  const ALLOWED_FORMAT = "application/json,.json";

  let fileInput: HTMLInputElement;
  let fileName = $state("");

  /**
   * Import JSON Files
   * @param event
   */
  async function handleChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    const file = input.files[0];

    try {
      const json = await loadArcFile(file);
      arcStore.init(json);
      fileName = file.name;
    } catch (error) {
      console.error(error);
    }
  }
</script>

<div class="min-h-screen w-full max-w-full flex flex-col justify-center items-center p-8">
  <Button class="p-6" onclick={() => fileInput.click()}>Upload ARC-RO-Crate JSON File</Button>
  <input class="hidden" type="file" accept={ALLOWED_FORMAT} bind:this={fileInput} onchange={handleChange} />
  {#if arcStore.initialised}
    <div class="flex w-full flex-col gap-2 py-4 font-bold">
      <h2 class="text-3xl">Status:</h2>
      <p>Filename: {fileName}</p>
      <p class="">{arcStore.definedOntologies.size + arcStore.undefinedOntologies.size} Ontologies were found</p>
      <p class="">{arcStore.definedOntologies.size} Ontologies are defined</p>
      <p class="">{arcStore.undefinedOntologies.size} Ontologies are not defined</p>
    </div>

    <div class="flex w-full flex-col">
      <h2 class="text-2xl font-bold underline py-4">Defined Ontologies</h2>
      <div class="flex flex-col gap-2">
        {#each arcStore.definedOntologies as ontology, i}
          <div class="grid grid-cols-2 shadow text-wrap break-all p-4">
            <p>{i} - {ontology[0]}</p>
            <div class="text-wrap">{ontology[1]}</div>
          </div>
        {/each}
      </div>

      <h2 class="text-2xl font-bold underline py-4">Undefined Ontologies</h2>
      <div class="flex flex-col gap-2">
        {#each arcStore.undefinedOntologies as ontology, i}
          <div class="grid grid-cols-2 shadow text-wrap p-4 break-all">
            <p>{i} - {ontology[0]}</p>
            <div class="text-wrap">{ontology[1]}</div>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>
