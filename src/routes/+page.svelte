<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import { arcStore } from "$lib/stores/ArcStore.svelte";

  let fileInput: HTMLInputElement;

  /**
   * Import JSON Files
   * @param event
   */
  function handleChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    const file = input.files[0];

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const json = JSON.parse(reader.result as string) as ARC_RO_JSON;
        console.log(json);
        arcStore.init(json);
      } catch (e) {
        alert("Ungültige JSON-Datei");
      }
    };

    reader.readAsText(file);
  }

  const allowedFormats = "application/json,.json";
</script>

<div class="min-h-screen flex justify-center items-center">
  <Button class="p-6" onclick={() => fileInput.click()}>Upload ARC-RO-Crate JSON File</Button>
  <input class="hidden" type="file" accept={allowedFormats} bind:this={fileInput} onchange={handleChange} />
</div>
