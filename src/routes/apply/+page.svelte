<script lang="ts">
    import Mapped from "$lib/components/ontologies/Mapped.svelte";
    import { Button } from "$lib/components/ui/button";
    import { success } from "$lib/services/toasts/toastService";
    import { arcStore } from "$lib/stores/arcs/ArcStore.svelte";
    import { mappingStore } from "$lib/stores/mapping/MappingStore.svelte";
    import { ChevronRight } from "lucide-svelte";
    let updatedValues = $state<number | null>(null);
    let toggleMapped = $state(false),
        toggleUnmapped = $state(false);

    function applyMapping() {
        updatedValues = arcStore.applyMapping();
        success("Updated " + updatedValues + " values");
    }
</script>

{#if mappingStore.mappedOntologies.length > 0}
    <div class="flex gap-2 items-center justify-between w-full pb-4">
        <h2 class="underline py-2">Mapped Ontology Values</h2>
        <Button onclick={() => applyMapping()} class="ml-auto px-8">Apply to ARC</Button>
    </div>

    {#if updatedValues !== null || arcStore.changedOntologies.length > 0}
        <div class="mb-4 flex w-full flex-wrap items-center justify-between gap-3 rounded-md border p-4">
            <p role="status">{updatedValues !== null ? `${updatedValues} values updated in the loaded ARC.` : "The loaded ARC has applied changes."}</p>
            {#if arcStore.changedOntologies.length > 0}
                <Button href="/commit">Review applied changes</Button>
            {/if}
        </div>
    {/if}

    <div class="w-full flex flex-col gap-2" class:hidden={toggleMapped}>
        {#each mappingStore.mappedOntologies as ontology (ontology.key)}
            <Mapped {ontology} />
        {/each}
    </div>
{:else}
    <div class="w-full h-full flex-1 flex flex-col gap-4 items-center justify-center">
        <Button class="px-16" href="/map">Start mapping</Button>
        <p>There are no mapped values yet. Create some mappings first</p>
    </div>
{/if}
