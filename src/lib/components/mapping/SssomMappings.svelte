<script lang="ts">
    import { ArrowRight } from "lucide-svelte";
    import { Badge } from "$lib/components/ui/badge";
    import { mappingStore } from "$lib/stores/mapping/MappingStore.svelte";

    interface Props {
        onlyMapped?: boolean;
    }

    let { onlyMapped = false }: Props = $props();

    const displayedMappings = $derived(
        onlyMapped ? mappingStore.mappedSssomMappings : mappingStore.mappingSet.mappings,
    );
</script>

<section class="mb-6 flex flex-col gap-4 rounded-lg border bg-card p-4 shadow-sm">
    <div class="flex items-center gap-2">
        <div>
            <h3>SSSOM mappings</h3>
            <p class="text-sm text-muted-foreground">Mappings created with SSSOM metadata.</p>
        </div>
        <Badge variant="outline" class="ml-auto">{displayedMappings.length}</Badge>
    </div>

    {#if displayedMappings.length > 0}
        <div class="flex flex-col gap-3">
            {#each displayedMappings as mapping}
                <article class="flex flex-col gap-3 rounded-md border p-3">
                    <div class="flex flex-wrap items-center gap-2">
                        <div class="min-w-40 flex-1">
                            <p class="font-medium wrap-break-word">{mapping.subjectLabel ?? mapping.subjectId}</p>
                            <p class="text-sm text-muted-foreground wrap-break-word">{mapping.subjectId}</p>
                        </div>
                        <ArrowRight class="shrink-0 text-muted-foreground" />
                        <Badge variant="outline">{mapping.predicateId}</Badge>
                        <ArrowRight class="shrink-0 text-muted-foreground" />
                        <div class="min-w-40 flex-1">
                            <p class="font-medium wrap-break-word">{mapping.objectLabel ?? mapping.objectId}</p>
                            <p class="text-sm text-muted-foreground wrap-break-word">{mapping.objectId}</p>
                        </div>
                    </div>

                    <div class="flex flex-wrap gap-2 text-sm text-muted-foreground">
                        <Badge variant="secondary">{mapping.mappingJustification}</Badge>
                        {#if mapping.confidence !== undefined}
                            <Badge variant="outline">Confidence {mapping.confidence}</Badge>
                        {/if}
                        {#if mapping.authorIds?.length}
                            <span>Authors: {mapping.authorIds.join(", ")}</span>
                        {/if}
                    </div>

                    {#if mapping.comment}
                        <p class="border-t pt-3 text-sm wrap-break-word">{mapping.comment}</p>
                    {/if}
                </article>
            {/each}
        </div>
    {:else}
        <p class="text-sm text-muted-foreground">
            {onlyMapped ? "No SSSOM mappings are relevant to the current ARC." : "No SSSOM mappings have been created yet."}
        </p>
    {/if}
</section>
