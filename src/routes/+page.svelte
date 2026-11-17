<script lang="ts">
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";

  onMount(() => {
    goto("/select-arc", { replaceState: true });
  });
</script>

<p>Opening ARC selection...</p>
