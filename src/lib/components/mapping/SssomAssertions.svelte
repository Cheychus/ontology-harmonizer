<script lang="ts">
    import { ArrowRight } from "lucide-svelte";
    import { Badge } from "$lib/components/ui/badge";
    import { mappingStore } from "$lib/stores/mapping/MappingStore.svelte";
</script>

<section class="mb-6 flex flex-col gap-4 rounded-lg border bg-card p-4 shadow-sm">
    <div class="flex items-center gap-2">
        <div>
            <h3>SSSOM assertions</h3>
            <p class="text-sm text-muted-foreground">Mappings created with SSSOM metadata.</p>
        </div>
        <Badge variant="outline" class="ml-auto">{mappingStore.mappingSet.assertions.length}</Badge>
    </div>

    {#if mappingStore.mappingSet.assertions.length > 0}
        <div class="flex flex-col gap-3">
            {#each mappingStore.mappingSet.assertions as assertion}
                <article class="flex flex-col gap-3 rounded-md border p-3">
                    <div class="flex flex-wrap items-center gap-2">
                        <div class="min-w-40 flex-1">
                            <p class="font-medium wrap-break-word">{assertion.subjectLabel ?? assertion.subjectId}</p>
                            <p class="text-sm text-muted-foreground wrap-break-word">{assertion.subjectId}</p>
                        </div>
                        <ArrowRight class="shrink-0 text-muted-foreground" />
                        <Badge variant="outline">{assertion.predicateId}</Badge>
                        <ArrowRight class="shrink-0 text-muted-foreground" />
                        <div class="min-w-40 flex-1">
                            <p class="font-medium wrap-break-word">{assertion.objectLabel ?? assertion.objectId}</p>
                            <p class="text-sm text-muted-foreground wrap-break-word">{assertion.objectId}</p>
                        </div>
                    </div>

                    <div class="flex flex-wrap gap-2 text-sm text-muted-foreground">
                        <Badge variant="secondary">{assertion.mappingJustification}</Badge>
                        {#if assertion.confidence !== undefined}
                            <Badge variant="outline">Confidence {assertion.confidence}</Badge>
                        {/if}
                        {#if assertion.authorIds?.length}
                            <span>Authors: {assertion.authorIds.join(", ")}</span>
                        {/if}
                    </div>

                    {#if assertion.comment}
                        <p class="border-t pt-3 text-sm wrap-break-word">{assertion.comment}</p>
                    {/if}
                </article>
            {/each}
        </div>
    {:else}
        <p class="text-sm text-muted-foreground">No SSSOM assertions have been created yet.</p>
    {/if}
</section>
