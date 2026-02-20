<script lang="ts">
    import { downloadObo } from "$lib/services/oboFiles/oboFile.service";
    import { oboFileStore } from "$lib/stores/oboFiles/OboFileStore.svelte";
    import Button from "../ui/button/button.svelte";
    import Term from "./Term.svelte";
    import { Switch } from "$lib/components/ui/switch/index.js";
    import { ChevronRight, ChevronsDown, Download } from "lucide-svelte";

    let oboJson = oboFileStore.oboJson;

    let toggleBtn = $state(true);
</script>

<div class="w-full h-full">
    <div class="flex gap-2 items-center">
        <h2 class="underline py-2">Ontology Mapping (OBO-JSON)</h2>
        <Button variant={"ghost"} size={"icon"} onclick={() => (toggleBtn = !toggleBtn)}
            ><ChevronRight class={`transition-transform duration-75 ${!toggleBtn ? "rotate-90" : ""}`} />
        </Button>
    </div>

    {#if oboFileStore.oboJson}
        <div class="flex flex-col gap-4" class:hidden={toggleBtn}>
            {#each oboFileStore.oboJson.terms as term, index}
                <div class="rounded shadow py-4 px-4">
                    <Term {term} {index} />
                </div>
            {/each}
        </div>
    {/if}
</div>
