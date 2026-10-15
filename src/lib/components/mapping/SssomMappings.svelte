<script lang="ts">
    import { ChevronDown, ChevronUp } from "lucide-svelte";
    import Button from "$lib/components/ui/button/button.svelte";
    import type { SssomMapping } from "$lib/types/mapping";
    import { mappingStore } from "$lib/stores/mapping/MappingStore.svelte";

    interface Props {
        onlyMapped?: boolean;
    }

    let { onlyMapped = false }: Props = $props();
    let expandedMappings: SssomMapping[] = $state([]);

    const displayedMappings = $derived(onlyMapped ? mappingStore.mappedSssomMappings : mappingStore.mappingSet.mappings);
    const allExpanded = $derived(displayedMappings.length > 0 && displayedMappings.every((mapping) => expandedMappings.includes(mapping)));

    const displayLabels: Record<string, string> = {
        "skos:exactMatch": "Exact match",
        "http://www.w3.org/2004/02/skos/core#exactMatch": "Exact match",
        "semapv:ManualMappingCuration": "Manual mapping curation",
        "https://w3id.org/semapv/vocab/ManualMappingCuration": "Manual mapping curation",
    };
</script>

<section class="mb-6 flex flex-col gap-4 rounded-lg border bg-card p-4 shadow-sm">
    <div class="flex items-center gap-2">
        <div>
            <h3>SSSOM mappings</h3>
            <p class="text-sm text-muted-foreground">Mappings created with SSSOM metadata.</p>
        </div>
        <span class="ml-auto text-sm text-muted-foreground">{displayedMappings.length}</span>
        {#if displayedMappings.length > 0}
            <Button variant="outline" size="sm" onclick={() => expandedMappings = allExpanded ? [] : [...displayedMappings]}>
                {allExpanded ? "Hide all details" : "Show all details"}
            </Button>
        {/if}
    </div>

    {#if displayedMappings.length > 0}
        <div class="overflow-x-auto">
            <table class="w-full table-auto text-left text-sm">
                <thead class="border-b text-muted-foreground">
                    <tr>
                        <th scope="col" class="w-1/2 px-3 py-3 font-medium">Subject</th>
                        <th scope="col" class="w-px whitespace-nowrap px-3 py-3 font-medium">Relation</th>
                        <th scope="col" class="w-1/2 px-3 py-3 font-medium">Object</th>
                        <th scope="col" class="w-px px-1 py-3"><span class="sr-only">Details</span></th>
                    </tr>
                </thead>
                <tbody>
                    {#each displayedMappings as mapping}
                        {@const expanded = expandedMappings.includes(mapping)}
                        <tr class="align-top" class:border-b={!expanded}>
                            <td
                                class="space-y-1 px-3 py-4 [overflow-wrap:anywhere]"
                            >
                                {#if mapping.subjectLabel}<p class="font-medium">{mapping.subjectLabel}</p>{/if}
                                <a
                                    href={mapping.subjectId}
                                    target="_blank"
                                    rel="noreferrer"
                                    class="text-muted-foreground underline underline-offset-2 hover:text-foreground">{mapping.subjectId}</a
                                >
                            </td>
                            <td class="whitespace-nowrap px-3 py-4">{displayLabels[mapping.predicateId] ?? mapping.predicateId}</td>
                            <td class="space-y-1 px-3 py-4 [overflow-wrap:anywhere]">
                                {#if mapping.objectLabel}<p class="font-medium">{mapping.objectLabel}</p>{/if}
                                <a
                                    href={mapping.objectId}
                                    target="_blank"
                                    rel="noreferrer"
                                    class="text-muted-foreground underline underline-offset-2 hover:text-foreground">{mapping.objectId}</a
                                >
                            </td>
                            <td class="px-1 py-3 text-right">
                                <button
                                    type="button"
                                    class="rounded px-2 py-1 hover:bg-muted focus-visible:outline-2"
                                    aria-label="Toggle mapping details"
                                    aria-expanded={expanded}
                                    onclick={() => expandedMappings = expanded ? expandedMappings.filter((item) => item !== mapping) : [...expandedMappings, mapping]}
                                >
                                    {#if expanded}
                                        <ChevronUp class="size-4" />
                                    {:else}
                                        <ChevronDown class="size-4" />
                                    {/if}
                                </button>
                            </td>
                        </tr>
                        {#if expanded}
                            <tr class="border-b">
                                <td colspan="4" class="px-6 pb-6 pt-0">
                                    <dl
                                        class="grid gap-x-6 gap-y-2 sm:grid-cols-[auto_minmax(0,1fr)] [&>dd]:[overflow-wrap:anywhere] [&>dt]:text-muted-foreground"
                                    >
                                        <dt>Method</dt>
                                        <dd>{displayLabels[mapping.mappingJustification] ?? mapping.mappingJustification}</dd>
                                        {#if mapping.confidence !== undefined}
                                            <dt>Confidence</dt>
                                            <dd>{mapping.confidence}</dd>
                                        {/if}
                                        {#if mapping.comment}
                                            <dt>Comment</dt>
                                            <dd>{mapping.comment}</dd>
                                        {/if}
                                        {#if mapping.authorIds?.length}
                                            <dt>Authors</dt>
                                            <dd>{mapping.authorIds.join(", ")}</dd>
                                        {/if}
                                        {#if mapping.reviewerIds?.length}
                                            <dt>Reviewers</dt>
                                            <dd>{mapping.reviewerIds.join(", ")}</dd>
                                        {/if}
                                        {#if mapping.mappingDate}
                                            <dt>Mapping date</dt>
                                            <dd>{mapping.mappingDate}</dd>
                                        {/if}
                                    </dl>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        class="mt-4"
                                        onclick={() => {
                                            mappingStore.removeSssomMapping(mapping);
                                            expandedMappings = expandedMappings.filter((item) => item !== mapping);
                                        }}
                                    >
                                        Remove mapping
                                    </Button>
                                </td>
                            </tr>
                        {/if}
                    {/each}
                </tbody>
            </table>
        </div>
    {:else}
        <p class="text-sm text-muted-foreground">
            {onlyMapped ? "No SSSOM mappings are relevant to the current ARC." : "No SSSOM mappings have been created yet."}
        </p>
    {/if}
</section>
