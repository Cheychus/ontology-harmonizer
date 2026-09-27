<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import { mappingStore } from "$lib/stores/mapping/MappingStore.svelte";
    import { Plus, X } from "lucide-svelte";

    let addingCuriePrefix = $state(false);
    let newCuriePrefix = $state("");
    let newCurieIri = $state("");
    let newCuriePrefixError = $state("");

    function addAdditionalCuriePrefix() {
        const prefix = newCuriePrefix.trim();
        const iri = newCurieIri.trim();

        if (!mappingStore.addCurieMapEntry(prefix, iri)) {
            newCuriePrefixError = "Enter a unique prefix and its URI.";
            return;
        }

        newCuriePrefix = "";
        newCurieIri = "";
        newCuriePrefixError = "";
        addingCuriePrefix = false;
    }
</script>

<section class="mb-6 flex flex-col gap-4 rounded-lg border bg-card p-4 shadow-sm">
    <div>
        <h3>Mapping set metadata</h3>
        <p class="text-sm text-muted-foreground">Details that describe this mapping set as a whole.</p>
    </div>

    <div class="grid gap-4 md:grid-cols-2">
        <div class="flex flex-col gap-2">
            <Label for="mapping-set-id">Mapping set ID</Label>
            <Input id="mapping-set-id" bind:value={mappingStore.mappingSet.metadata.mappingSetId} />
        </div>
        <div class="flex flex-col gap-2">
            <Label for="mapping-set-license">License</Label>
            <Input id="mapping-set-license" bind:value={mappingStore.mappingSet.metadata.license} placeholder="e.g. CC-BY-4.0" />
        </div>
        <div class="flex flex-col gap-2">
            <Label for="mapping-set-title">Title</Label>
            <Input id="mapping-set-title" bind:value={mappingStore.mappingSet.metadata.title} />
        </div>
        <div class="flex flex-col gap-2">
            <Label for="mapping-set-version">Version</Label>
            <Input id="mapping-set-version" bind:value={mappingStore.mappingSet.metadata.version} />
        </div>
    </div>

    <div class="flex flex-col gap-2">
        <Label for="mapping-set-description">Description</Label>
        <textarea
            id="mapping-set-description"
            class="border-input bg-background ring-offset-background focus-visible:border-ring focus-visible:ring-ring/50 min-h-20 w-full rounded-md border px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
            bind:value={mappingStore.mappingSet.metadata.description}
        ></textarea>
    </div>

    <div class="flex flex-col gap-2">
        <Label for="mapping-set-comment">Comment</Label>
        <textarea
            id="mapping-set-comment"
            class="border-input bg-background ring-offset-background focus-visible:border-ring focus-visible:ring-ring/50 min-h-20 w-full rounded-md border px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
            bind:value={mappingStore.mappingSet.metadata.comment}
        ></textarea>
    </div>

    <div class="flex flex-col gap-2">
        <div class="flex items-center gap-2">
            <Label>CURIE prefixes</Label>
            <Button variant="outline" size="sm" onclick={() => (addingCuriePrefix = !addingCuriePrefix)}><Plus /> Add prefix</Button>
        </div>
        {#if addingCuriePrefix}
            <div class="flex flex-col gap-2 rounded-md border p-3">
                <div class="flex gap-2">
                    <Input
                        aria-label="New CURIE prefix"
                        placeholder="Prefix, e.g. orcid"
                        bind:value={newCuriePrefix}
                        oninput={() => (newCuriePrefixError = "")}
                    />
                    <Input aria-label="New CURIE prefix IRI" placeholder="URI, e.g. https://orcid.org/" bind:value={newCurieIri} />
                    <Button variant="outline" size="sm" onclick={addAdditionalCuriePrefix}>Add</Button>
                </div>
                {#if newCuriePrefixError}
                    <p class="text-sm text-destructive">{newCuriePrefixError}</p>
                {/if}
            </div>
        {/if}
        {#if mappingStore.mappingSet.metadata.curieMap.length > 0}
            <div class="flex flex-col gap-2">
                {#each mappingStore.mappingSet.metadata.curieMap as entry, index}
                    <div class="flex items-center gap-2">
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
