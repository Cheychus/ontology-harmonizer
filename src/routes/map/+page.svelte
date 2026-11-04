<script lang="ts">
    import FocusCard from "$lib/components/mapping/FocusCard.svelte";
    import Button from "$lib/components/ui/button/button.svelte";
    import { arcStore, type DerivedOntology } from "$lib/stores/arcs/ArcStore.svelte";
    import { mappingStore } from "$lib/stores/mapping/MappingStore.svelte";
    import { ChevronDown, CircleCheck, Download, Play } from "lucide-svelte";
    import { fade } from "svelte/transition";
    import { startDemo } from "$lib/services/demo/demo";
    import { exportMapping } from "$lib/services/sssom/serializeSssomTsv";
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
        <div class="w-24 md:w-48">
            {#if currentOntology}
                <Button class="w-full" disabled={!canMap} onclick={onMap}>Map</Button>
            {/if}
        </div>
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
    <section class="flex w-full max-w-5xl flex-col gap-6 self-start">
        <h2>Map ontology values</h2>
        <div class="flex flex-col items-start gap-4 rounded-lg border bg-card p-4 shadow-sm">
            <div>
                <h3>Select an ARC to start mapping</h3>
                <p class="text-sm text-muted-foreground">Load an ARC to see its metadata fields and assign ontology terms.</p>
            </div>
            {#if mappingStore.hasMappingSet}
                <p class="text-sm text-muted-foreground">Your mapping is ready. Select an ARC to use it.</p>
            {/if}
            <div class="flex flex-wrap gap-2">
                <Button href="/select-arc">Select ARC</Button>
                <Button variant="outline" onclick={startDemo}><Play />Try demo ARC</Button>
            </div>
        </div>
    </section>
{:else if !mappingStore.hasMappingSet}
    <section class="flex w-full max-w-5xl flex-col gap-6 self-start">
        <h2>Map ontology values</h2>
        <div class="flex flex-col items-start gap-4 rounded-lg border bg-card p-4 shadow-sm">
            <div>
                <h3>Configure a mapping to continue</h3>
                <p class="text-sm text-muted-foreground">Your ARC is loaded. Create or import a mapping before assigning ontology terms.</p>
            </div>
            <Button href="/mapping">Configure mapping</Button>
        </div>
    </section>
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
            <div class="focus-container min-h-0 flex-1">
                <section class="flex h-full min-h-80 flex-col items-start gap-5 rounded-lg border bg-card p-6 shadow-sm lg:min-h-0" in:fade={{ duration: 150 }}>
                    {#if arcStore.ontologyCandidates.size === 0}
                        <div>
                            <h2>No ontology fields found</h2>
                            <p class="mt-2 text-sm text-muted-foreground">This ARC has no supported ontology fields to map. Select another ARC to continue.</p>
                        </div>
                        <Button href="/select-arc">Select another ARC</Button>
                    {:else}
                        <div role="status">
                            <div class="flex items-center gap-3">
                                <h2>{mappingStore.skipped.length > 0 ? "All terms reviewed" : "Mapping complete"}</h2>
                                <CircleCheck class="size-6 shrink-0 text-green-600" aria-hidden="true" />
                            </div>
                            <p class="mt-2 text-sm text-muted-foreground">
                                {mappingStore.skipped.length > 0
                                    ? "Some terms were skipped. Revisit them or review your completed mappings."
                                    : "Your mapping is ready to download or apply to the ARC."}
                            </p>
                        </div>
                        <p class="text-sm"><span class="font-medium">{done} mapped</span><span class="ml-4 text-muted-foreground">{mappingStore.skipped.length} skipped</span></p>
                        <div class="flex w-full flex-wrap gap-2">
                            {#if done > 0}<Button href="/apply">Review changes</Button>{/if}
                            <Button variant="outline" onclick={exportMapping}><Download />Download SSSOM TSV</Button>
                        </div>
                    {/if}
                </section>
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
