<script lang="ts">
    import { oboFileStore } from "$lib/stores/oboFiles/OboFileStore.svelte";
    import Button from "../ui/button/button.svelte";

    let toggleBtn = $state(true);
</script>

<div class="flex gap-2 items-center">
    <Button variant={"ghost"} size={"icon"} onclick={() => (toggleBtn = !toggleBtn)}
        ><svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="size-6"
            class:rotate-180={toggleBtn}
        >
            <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 18.75 7.5-7.5 7.5 7.5" />
            <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 7.5-7.5 7.5 7.5" />
        </svg>
    </Button>
    <h2 class="underline py-2">Ontology Mapping (OBO File)</h2>
</div>

<div class="shadow rounded w-full h-full p-4" class:hidden={toggleBtn}>
    <textarea rows="16" disabled class="w-full h-full resize-none">{oboFileStore.rawOboString}</textarea>
</div>
