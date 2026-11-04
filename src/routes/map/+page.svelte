<script lang="ts">
    import FocusCard from "$lib/components/mapping/FocusCard.svelte";
    import Button from "$lib/components/ui/button/button.svelte";
    import { arcStore, type DerivedOntology } from "$lib/stores/arcs/ArcStore.svelte";
    import { mappingStore } from "$lib/stores/mapping/MappingStore.svelte";
    import { ChevronDown } from "lucide-svelte";
    import * as Collapsible from "$lib/components/ui/collapsible";
    import SssomMappings from "$lib/components/mapping/SssomMappings.svelte";

    let progress = $derived(arcStore.ontologyCandidates.size ? ((mappingStore.mappedOntologies.length + mappingStore.skipped.length) / arcStore.ontologyCandidates.size) * 100 : 0),
        done = $derived(mappingStore.mappedOntologies.length),
        total = $derived(arcStore.ontologyCandidates.size - mappingStore.skipped.length);

    let queue = $derived(mappingStore.queue);
    let currentOntology: DerivedOntology | null = $derived(mappingStore.current);
    type Section = "mapped" | "queue" | "skipped";
    let openSection = $state<Section | null>(null);
    let footerHeight = $state(60);
    let dropdownHeight = $state(30);

    function setOpenSection(section: Section, open: boolean) {
        if (open) openSection = section;
        else if (openSection === section) openSection = null;
    }
</script>

{#snippet mappingFooter(onMap: () => void, canMap: boolean)}
    <div bind:clientHeight={footerHeight} class="fixed inset-x-0 bottom-0 z-40 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 border-t bg-background px-4 py-3 shadow-sm md:px-8">
        <Button class="w-24 md:w-48" disabled={!canMap} onclick={onMap}>Map</Button>
        <div class="mx-auto flex w-full max-w-xl min-w-0 flex-col gap-1">
            <p class="text-center text-xs text-muted-foreground">{done} of {total} mapped · Skipped {mappingStore.skipped.length}</p>
            <div class="h-2 overflow-hidden rounded-full bg-gray-200" role="progressbar" aria-label="Mapping progress" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
                <div class="h-full bg-green-500 transition-all duration-300" style="width: {progress}%"></div>
            </div>
        </div>
        <Button class="h-auto min-h-9 w-24 whitespace-normal text-center md:w-48" href="/apply">Review changes</Button>
    </div>
{/snippet}

{#if !arcStore.initialised}
    <div class="w-full h-full flex-1 flex flex-col gap-4 items-center justify-center">
        <Button class="px-16" href="/select-arc">Select ARC</Button>
        <p>Currently no ARC is initialised. You need to select an ARC first.</p>
    </div>
{:else if !mappingStore.hasMappingSet}
    <div class="flex w-full flex-1 flex-col items-center justify-center gap-4">
        <p>Create or import a mapping before assigning ontology terms.</p>
        <Button href="/mapping">Configure mapping</Button>
    </div>
{:else}
    <div
        class="min-h-0 w-full flex-1 flex flex-col gap-2"
        style:--footer-height={`${footerHeight}px`}
        style:--dropdown-height={`${dropdownHeight}px`}
    >


        {#if currentOntology}
            <div class="focus-container flex-1 min-h-0">
                {#key currentOntology.key}
                    <FocusCard {currentOntology} footer={mappingFooter} />
                {/key}
            </div>
        {:else}
            <div class="w-full h-full py-16 flex flex-col gap-4 justify-center items-center">
                <p class="text-muted-foreground">You have finished the mapping process.</p>
            </div>
            {@render mappingFooter(() => {}, false)}
        {/if}

        <div class="grid w-full max-w-5xl shrink-0 grid-cols-[max-content_max-content_minmax(0,1fr)] gap-3 pt-4">
            <Collapsible.Root open={openSection === "mapped"} onOpenChange={(open) => setOpenSection("mapped", open)} class="contents">
                <div bind:clientHeight={dropdownHeight} class="col-start-1 row-start-1">
                <Collapsible.Trigger
                    class="inline-flex items-center justify-between gap-2 rounded-md border px-3 py-1 text-sm hover:bg-accent"
                    aria-label="Show mapped SSSOM mappings"
                    title="Show mapped SSSOM mappings"
                >
                    Mapped ({done})
                    <ChevronDown class={`size-4 transition-transform ${openSection === "mapped" ? "rotate-180" : ""}`} />
                </Collapsible.Trigger>
                </div>
                <Collapsible.Content class="col-span-3 row-start-2 min-w-0 rounded-md border p-3">
                    <SssomMappings onlyMapped />
                </Collapsible.Content>
            </Collapsible.Root>

            <Collapsible.Root open={openSection === "queue"} onOpenChange={(open) => setOpenSection("queue", open)} class="contents">
                <Collapsible.Trigger class="col-start-2 row-start-1 inline-flex items-center justify-between gap-2 rounded-md border px-3 py-1 text-sm hover:bg-accent">
                    Queue ({queue.length})
                    <ChevronDown class={`size-4 transition-transform ${openSection === "queue" ? "rotate-180" : ""}`} />
                </Collapsible.Trigger>
                <Collapsible.Content class="col-span-3 row-start-2 min-w-0 space-y-2 rounded-md border p-3">
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
                    {:else}
                        <p class="text-sm text-muted-foreground">No queued values.</p>
                    {/each}
                </Collapsible.Content>
            </Collapsible.Root>
            <Collapsible.Root open={openSection === "skipped"} onOpenChange={(open) => setOpenSection("skipped", open)} class="contents">
                <Collapsible.Trigger class="col-start-3 row-start-1 inline-flex items-center justify-between justify-self-start gap-2 rounded-md border px-3 py-1 text-sm hover:bg-accent">
                    Skipped ({mappingStore.skipped.length})
                    <ChevronDown class={`size-4 transition-transform ${openSection === "skipped" ? "rotate-180" : ""}`} />
                </Collapsible.Trigger>
                <Collapsible.Content class="col-span-3 row-start-2 min-w-0 space-y-2 rounded-md border p-3">
                    {#each mappingStore.skipped as ontology, idx}
                        <div class="shadow p-1 rounded-sm flex justify-between items-center">
                            <p>{ontology.key}</p>
                            <Button variant="secondary" onclick={() => mappingStore.undoSkip(idx)}>Undo</Button>
                        </div>
                    {:else}
                        <p class="text-sm text-muted-foreground">No skipped values.</p>
                    {/each}
                </Collapsible.Content>
            </Collapsible.Root>
        </div>
        <div class="shrink-0" style:height={`${footerHeight + 12}px`} aria-hidden="true"></div>
    </div>
{/if}

<style>
    @media (min-width: 64rem) {
        .focus-container {
            /* Reserve only the closed dropdown row; expanded lists grow below it. */
            height: max(36rem, calc(100dvh - 6.25rem - var(--footer-height) - var(--dropdown-height) - 2.75rem));
            flex: none;
        }
    }
</style>
