<script lang="ts">
    import { oboFileStore } from "$lib/stores/oboFiles/OboFileStore.svelte";
</script>

<div class="shadow rounded w-full h-full p-4">
    <h3 class="font-bold text-lg underline py-2">Ontology Mapping (OBO File)</h3>
    <textarea rows="16" disabled class="w-full h-full resize-none">{oboFileStore.rawOboString}</textarea>
</div>
