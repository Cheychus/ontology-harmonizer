<script lang="ts">
    import HelpHint from "$lib/components/HelpHint.svelte";
    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import * as Select from "$lib/components/ui/select";
    import { mappingStore } from "$lib/stores/mapping/MappingStore.svelte";
    import { createDefaultMappingSet } from "$lib/services/sssom/parseSssomTsvData";
    import { Plus, X } from "lucide-svelte";

    let addingCuriePrefix = $state(false);
    let newCuriePrefix = $state("");
    let newCurieIri = $state("");
    let newCuriePrefixError = $state("");

    const iriHint = "Enter a complete URL starting with https:// or http://, e.g. https://orcid.org/.";
    const standardPrefixes = createDefaultMappingSet().metadata.curieMap.map((entry) => entry.prefix);
    const licenses = [
        { label: "CC0 1.0 – Public Domain", value: "https://creativecommons.org/publicdomain/zero/1.0/" },
        { label: "CC BY 4.0 – Attribution", value: "https://creativecommons.org/licenses/by/4.0/" },
        { label: "CC BY-SA 4.0 – Attribution-ShareAlike", value: "https://creativecommons.org/licenses/by-sa/4.0/" },
        { label: "CC BY-NC 4.0 – Attribution-NonCommercial", value: "https://creativecommons.org/licenses/by-nc/4.0/" },
        { label: "CC BY-NC-SA 4.0 – Attribution-NonCommercial-ShareAlike", value: "https://creativecommons.org/licenses/by-nc-sa/4.0/" },
        { label: "CC BY-ND 4.0 – Attribution-NoDerivatives", value: "https://creativecommons.org/licenses/by-nd/4.0/" },
        { label: "CC BY-NC-ND 4.0 – Attribution-NonCommercial-NoDerivatives", value: "https://creativecommons.org/licenses/by-nc-nd/4.0/" },
    ];
    const licenseLabel = $derived(
        licenses.find((license) => license.value === mappingStore.mappingSet.metadata.license)?.label
            ?? (mappingStore.mappingSet.metadata.license || "Select a license"),
    );

    function isValidCurieIri(iri: string) {
        return iri.startsWith("https://") || iri.startsWith("http://") || iri === "mailto:";
    }

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
            <div class="flex items-center gap-2"><Label for="mapping-set-id">Mapping set ID</Label> <HelpHint helpKey="mappingSetId" /></div>
            <Input id="mapping-set-id" bind:value={mappingStore.mappingSet.metadata.mappingSetId} />
        </div>
        <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2"><Label for="mapping-set-license">License</Label> <HelpHint helpKey="license" /></div>
            <Select.Root type="single" bind:value={mappingStore.mappingSet.metadata.license}>
                <Select.Trigger id="mapping-set-license" class="w-full min-w-0">
                    <span class="truncate">{licenseLabel}</span>
                </Select.Trigger>
                <Select.Content>
                    <Select.Group>
                        {#each licenses as license (license.value)}
                            <Select.Item value={license.value} label={license.label}>{license.label}</Select.Item>
                        {/each}
                    </Select.Group>
                </Select.Content>
            </Select.Root>
        </div>
        <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2"><Label for="mapping-set-title">Title</Label> <HelpHint helpKey="title" /></div>
            <Input id="mapping-set-title" bind:value={mappingStore.mappingSet.metadata.title} />
        </div>
        <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2"><Label for="mapping-set-version">Version</Label> <HelpHint helpKey="version" /></div>
            <Input id="mapping-set-version" bind:value={mappingStore.mappingSet.metadata.version} />
        </div>
    </div>

    <div class="flex flex-col gap-2">
        <div class="flex items-center gap-2"><Label for="mapping-set-description">Description</Label> <HelpHint helpKey="description" /></div>
        <textarea
            id="mapping-set-description"
            class="border-input bg-background ring-offset-background focus-visible:border-ring focus-visible:ring-ring/50 min-h-20 w-full rounded-md border px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
            bind:value={mappingStore.mappingSet.metadata.description}></textarea>
    </div>

    <div class="flex flex-col gap-2">
        <div class="flex items-center gap-2"><Label for="mapping-set-comment">Comment</Label> <HelpHint helpKey="mappingSetComment" /></div>
        <textarea
            id="mapping-set-comment"
            class="border-input bg-background ring-offset-background focus-visible:border-ring focus-visible:ring-ring/50 min-h-20 w-full rounded-md border px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
            bind:value={mappingStore.mappingSet.metadata.comment}></textarea>
    </div>

    <div class="flex flex-col gap-2">
        <div class="flex items-center gap-2">
            <Label>CURIE prefixes</Label>
            <HelpHint helpKey="curieMap" />
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
                    <Input
                        aria-label="New CURIE prefix IRI"
                        aria-invalid={Boolean(newCurieIri) && !isValidCurieIri(newCurieIri)}
                        placeholder="URI, e.g. https://orcid.org/"
                        bind:value={newCurieIri}
                    />
                    <Button variant="outline" size="sm" disabled={!isValidCurieIri(newCurieIri)} onclick={addAdditionalCuriePrefix}>Add</Button>
                </div>
                {#if newCurieIri && !isValidCurieIri(newCurieIri)}
                    <p class="text-sm text-destructive">{iriHint}</p>
                {/if}
                {#if newCuriePrefixError}
                    <p class="text-sm text-destructive">{newCuriePrefixError}</p>
                {/if}
            </div>
        {/if}
        {#if mappingStore.mappingSet.metadata.curieMap.length > 0}
            <div class="flex flex-col gap-2">
                {#if mappingStore.mappingSet.metadata.curieMap.some((entry) => standardPrefixes.includes(entry.prefix))}
                    <div class="flex flex-col gap-1 rounded-md border py-3">
                        <p class="px-3 text-sm font-medium">Mapping defaults</p>
                        <p class="mb-1 px-3 text-xs text-muted-foreground">Fixed prefixes used by this application.</p>
                        {#each mappingStore.mappingSet.metadata.curieMap as entry}
                            {#if standardPrefixes.includes(entry.prefix)}
                                <div class="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_2rem] items-center gap-2 text-sm">
                                    <span class="min-w-0 break-all px-3 py-1 font-medium">{entry.prefix}</span>
                                    <span class="min-w-0 break-all px-3 py-1 text-muted-foreground">{entry.iri}</span>
                                </div>
                                {#if !isValidCurieIri(entry.iri)}
                                    <p class="px-3 text-sm text-destructive">{iriHint}</p>
                                {/if}
                            {/if}
                        {/each}
                    </div>
                {/if}
                {#each mappingStore.mappingSet.metadata.curieMap as entry, index}
                    {#if !standardPrefixes.includes(entry.prefix)}
                        <div class="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_2rem] items-center gap-2">
                            <Input aria-label="CURIE prefix" bind:value={entry.prefix} />
                            <Input aria-label="CURIE prefix IRI" aria-invalid={!isValidCurieIri(entry.iri)} bind:value={entry.iri} />
                            <Button
                                variant="outline"
                                size="icon-sm"
                                aria-label={`Remove ${entry.prefix || "CURIE prefix"}`}
                                onclick={() => mappingStore.removeCurieMapEntry(index)}
                            >
                                <X />
                            </Button>
                        </div>
                        {#if !isValidCurieIri(entry.iri)}
                            <p class="text-sm text-destructive">{iriHint}</p>
                        {/if}
                    {/if}
                {/each}
            </div>
        {:else}
            <p class="text-sm text-muted-foreground">No CURIE prefixes have been added.</p>
        {/if}
    </div>
</section>
