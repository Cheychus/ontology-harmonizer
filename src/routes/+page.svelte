<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import { Input } from "$lib/components/ui/input/index.js";

  let fileInput: HTMLInputElement;

  function handleChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    const file = input.files[0];

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const json = JSON.parse(reader.result as string);
        console.log(json);
      } catch (e) {
        alert("Ungültige JSON-Datei");
      }
    };
    console.log(file);

    reader.readAsText(file);
  }

  const allowedFormats = "application/json,.json";
</script>

<div class="min-h-screen flex justify-center items-center">
  <Button class="p-6" onclick={() => fileInput.click()}>Upload ARC-RO-Crate JSON File</Button>
  <input class="hidden" type="file" accept={allowedFormats} bind:this={fileInput} onchange={handleChange} />
</div>
