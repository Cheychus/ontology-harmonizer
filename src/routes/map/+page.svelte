<script lang="ts">
    import FocusCard from "$lib/components/mapping/FocusCard.svelte";
    import Button from "$lib/components/ui/button/button.svelte";
    import { arcStore, type DerivedOntology } from "$lib/stores/arcs/ArcStore.svelte";
    import { mappingStore } from "$lib/stores/mapping/MappingStore.svelte";
    import { Settings } from "lucide-svelte";

    let progress = $derived(((mappingStore.mappedOntologies.length + mappingStore.skipped.length) / arcStore.ontologyCandidates.size) * 100),
        done = $derived(mappingStore.mappedOntologies.length),
        total = $derived(arcStore.ontologyCandidates.size - mappingStore.skipped.length);

    let queue = $derived(mappingStore.queue);
    let currentOntology: DerivedOntology | null = $derived(mappingStore.current);
</script>

{#if !arcStore.initialised}
    <div class="w-full h-full flex-1 flex flex-col gap-4 items-center justify-center">
        <Button class="px-16" href="/select-arc">Select ARC</Button>
        <p>Currently no ARC is initialised. You need to select an ARC first.</p>
    </div>
{:else}
    <div class="min-h-0 h-screen w-full flex-1 flex flex-col gap-2">
        <div class="shrink-0 flex justify-between items-center pb-4 gap-2">
            <h2>Map Ontology Values</h2>
            <Button variant="outline" class="ml-auto px-16" href="/mapping" size="lg"><Settings /> Mapping</Button>
            <Button class="px-16" href="/apply" size="lg">Continue</Button>
        </div>

        <div class="shrink-0 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div class="h-full bg-green-500 transition-all duration-300" style="width: {progress}%"></div>
        </div>
        <div class="flex gap-8">
            <p class="text-sm text-gray-500">
                {done} of {total} mapped ({Math.round(progress)}%) - Skipped {mappingStore.skipped.length}
            </p>
        </div>

        {#if currentOntology}
            <div class="flex-1 min-h-0">
                {#key currentOntology.key}
                    <FocusCard {currentOntology} />
                {/key}
            </div>
        {:else}
            <div class="w-full h-full py-16 flex flex-col gap-4 justify-center items-center">
                <p class="text-muted-foreground">You have finished the mapping process.</p>
            </div>
        {/if}

        <div class="grid grid-cols-2 gap-6 pt-8">
            <div class="flex flex-col gap-2">
                <h3 class="">Queue {queue.length}</h3>
                {#each queue as ontology, i}
                    <div class="shadow p-1 rounded-sm flex justify-between items-center">
                        <p class="">{ontology.key}</p>
                        <Button
                            onclick={() => {
                                if (currentOntology) {
                                    queue.push(currentOntology);
                                    currentOntology = ontology;
                                    queue.splice(i, 1);
                                }
                            }}
                            variant="outline">Select</Button
                        >
                    </div>
                {/each}
            </div>
            <div class="flex flex-col gap-2">
                <h3>Skipped {mappingStore.skipped.length}</h3>
                {#each mappingStore.skipped as ontology, idx}
                    <div class="shadow p-1 rounded-sm flex justify-between items-center">
                        <p>{ontology.key}</p>
                        <Button variant="secondary" onclick={() => mappingStore.undoSkip(idx)}>Undo</Button>
                    </div>
                {/each}
            </div>
        </div>
    </div>
{/if}
