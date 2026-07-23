<script>
    import { goto } from "$app/navigation";
    import Mapped from "$lib/components/ontologies/Mapped.svelte";
    import { Button } from "$lib/components/ui/button";
    import { success } from "$lib/services/toasts/toastService";
    import { arcStore } from "$lib/stores/arcs/ArcStore.svelte";
    import { mappingStore } from "$lib/stores/mapping/MappingStore.svelte";
    import { ChevronRight } from "lucide-svelte";
    let toggleMapped = $state(false),
        toggleUnmapped = $state(false);

    function applyMapping() {
        const updatedValues = arcStore.applyMapping();
        success("Updated " + updatedValues + " values");
        goto("/commit");
    }
</script>

{#if mappingStore.mappedOntologies.length > 0}
    <div class="flex gap-2 items-center justify-between w-full pb-4">
        <h2 class="underline py-2">Mapped Ontology Values</h2>
        <Button onclick={() => applyMapping()} class="ml-auto px-8">Apply Mapping</Button>
    </div>

    <div class="w-full flex flex-col gap-2" class:hidden={toggleMapped}>
        {#each mappingStore.mappedOntologies as ontology (ontology.key)}
            <Mapped {ontology} />
        {/each}
    </div>
{:else}
    <div class="w-full h-full flex-1 flex flex-col gap-4 items-center justify-center">
        <Button class="px-16" href="/map">Map Values</Button>
        <p>There are no mapped values yet. Create some mappings first</p>
    </div>
{/if}
