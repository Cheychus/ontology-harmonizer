<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import { mappingStore } from "$lib/stores/mapping/MappingStore.svelte";
    import { Plus, X } from "lucide-svelte";
</script>

<section class="mb-6 flex flex-col gap-4 rounded-lg border bg-card p-4 shadow-sm">
    <div>
        <h3>Mapping set metadata</h3>
        <p class="text-sm text-muted-foreground">Details that describe this mapping set as a whole.</p>
    </div>

    <div class="grid gap-4 md:grid-cols-2">
        <div class="flex flex-col gap-2">
            <Label for="mapping-set-id">Mapping set ID</Label>
            <Input id="mapping-set-id" bind:value={mappingStore.mappingSetMetadata.mappingSetId} />
        </div>
        <div class="flex flex-col gap-2">
            <Label for="mapping-set-license">License</Label>
            <Input id="mapping-set-license" bind:value={mappingStore.mappingSetMetadata.license} placeholder="e.g. CC-BY-4.0" />
        </div>
        <div class="flex flex-col gap-2">
            <Label for="mapping-set-title">Title</Label>
            <Input id="mapping-set-title" bind:value={mappingStore.mappingSetMetadata.title} />
        </div>
        <div class="flex flex-col gap-2">
            <Label for="mapping-set-version">Version</Label>
            <Input id="mapping-set-version" bind:value={mappingStore.mappingSetMetadata.version} />
        </div>
    </div>

    <div class="flex flex-col gap-2">
        <Label for="mapping-set-description">Description</Label>
        <textarea
            id="mapping-set-description"
            class="border-input bg-background ring-offset-background focus-visible:border-ring focus-visible:ring-ring/50 min-h-20 w-full rounded-md border px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
            bind:value={mappingStore.mappingSetMetadata.description}
        ></textarea>
    </div>

    <div class="flex flex-col gap-2">
        <Label for="mapping-set-comment">Comment</Label>
        <textarea
            id="mapping-set-comment"
            class="border-input bg-background ring-offset-background focus-visible:border-ring focus-visible:ring-ring/50 min-h-20 w-full rounded-md border px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
            bind:value={mappingStore.mappingSetMetadata.comment}
        ></textarea>
    </div>

    <div class="flex flex-col gap-2">
        <div class="flex items-center gap-2">
            <Label>CURIE map</Label>
            <Button variant="outline" size="sm" onclick={() => mappingStore.addCurieMapEntry()}><Plus /> Add prefix</Button>
        </div>
        {#if mappingStore.mappingSetMetadata.curieMap.length > 0}
            <div class="flex flex-col gap-2">
                {#each mappingStore.mappingSetMetadata.curieMap as entry, index}
                    <div class="flex gap-2">
                        <Input aria-label="CURIE prefix" bind:value={entry.prefix} />
                        <Input aria-label="CURIE prefix IRI" class="" bind:value={entry.iri} />
                        <Button
                            variant="outline"
                            size="icon-sm"
                            aria-label={`Remove ${entry.prefix || "CURIE prefix"}`}
                            onclick={() => mappingStore.removeCurieMapEntry(index)}
                        >
                            <X />
                        </Button>
                    </div>
                {/each}
            </div>
        {:else}
            <p class="text-sm text-muted-foreground">No CURIE prefixes have been added.</p>
        {/if}
    </div>
</section>
