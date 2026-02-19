<script lang="ts">
    import { downloadObo } from "$lib/services/oboFiles/oboFile.service";
    import { oboFileStore } from "$lib/stores/oboFiles/OboFileStore.svelte";
    import Button from "../ui/button/button.svelte";
    import Term from "./Term.svelte";

    let oboJson = oboFileStore.oboJson;
</script>

<div class="w-full h-full p-4">
    <div class="flex gap-2 items-center">
        <h2 class="underline py-2">Ontology Mapping (OBO-JSON)</h2>
        <Button variant={"outline"} onclick={() => downloadObo(oboFileStore.rawOboString)}
            ><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                />
            </svg>
        </Button>
    </div>

    {#if oboFileStore.oboJson}
        <div class="flex flex-col gap-4">
            {#each oboFileStore.oboJson.terms as term, index}
                <div class="rounded shadow py-4 px-4">
                    <Term {term} {index} />
                </div>
            {/each}
        </div>
    {/if}
</div>
