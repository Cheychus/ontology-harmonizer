<script lang="ts">
    import { goto } from "$app/navigation";
    import { Button } from "$lib/components/ui/button";
    import { applicationStore } from "$lib/stores/application/ApplicationStore.svelte";
    import { mappingStore } from "$lib/stores/mapping/MappingStore.svelte";
    import { Download, Upload, X } from "lucide-svelte";
    import { failure, success } from "$lib/services/toasts/toastService";
    import MappingSetMetadata from "$lib/components/mapping/MappingSetMetadata.svelte";
    import SssomMappings from "$lib/components/mapping/SssomMappings.svelte";
    import { parseSssomInServer } from "$lib/services/sssom/parseSssomTsvData";
    import { parseMappingSetJson } from "$lib/services/sssom/parseMappingSetJson";

    let jsonFileInput: HTMLInputElement;
    let sssomFileInput: HTMLInputElement;
    async function handleJsonChange(event: Event) {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (!file) return;

        try {
            const mappingSet = parseMappingSetJson(await file.text());
            mappingStore.loadMappingSet(mappingSet);
            mappingStore.fileName = file.name;
            success("JSON mapping was uploaded");
        } catch {
            failure("Could not load JSON mapping");
        } finally {
            input.value = "";
        }
    }

    async function handleSssomChange(event: Event) {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (!file) return;

        const result = await parseSssomInServer(file);
        mappingStore.fileName = file.name;
        mappingStore.loadSssom(result);
        success("SSSOM mapping was uploaded");
    }

    function next() {
        mappingStore.createMappingSet();
        applicationStore.stepState.mappingConfigured = true;
        goto("/map");
    }

</script>

<input class="hidden" type="file" accept=".tsv,text/tab-separated-values" bind:this={sssomFileInput} onchange={handleSssomChange} />
<input class="hidden" type="file" accept=".json,application/json" bind:this={jsonFileInput} onchange={handleJsonChange} />

{#if mappingStore.hasMappingSet}
    <div class="w-full flex-1">
        <div class="flex gap-2 items-center pb-8">
            <h2>Mapping: {mappingStore.fileName.replace(/\.(json|tsv)$/, "")}</h2>
            <Button
                onclick={() => {
                    mappingStore.reset();
                    success("Mapping was removed");
                }}
                variant="destructive"
                size="icon-sm"
                class="flex items-center"><X /></Button
            >

            <Button class="ml-auto px-16" href="/map" size="lg">Continue</Button>
        </div>
        <div class="flex gap-2 pb-2">
            <Button variant="outline" onclick={() => jsonFileInput.click()}><Upload />Upload JSON</Button>
            <Button variant="outline" onclick={() => sssomFileInput.click()}><Upload />Upload SSSOM TSV</Button>
            <Button variant="outline" disabled title="SSSOM export will be added in a future update"><Download />Export SSSOM (coming soon)</Button>
        </div>

        <MappingSetMetadata />

        <SssomMappings />

    </div>
{:else}
    <div class="w-full h-full min-h-full flex-1 flex flex-col gap-4 justify-center items-center">
        <div class="flex items-center gap-4">
            <Button variant="secondary" onclick={() => jsonFileInput.click()}><Upload />Upload JSON</Button>
            <Button variant="secondary" onclick={() => sssomFileInput.click()}><Upload />Upload SSSOM TSV</Button>
            <Button variant="default" onclick={() => next()}>Create new Mapping</Button>
        </div>
        <p>You can upload an existing mapping here or skip this step and create a new mapping</p>
    </div>
{/if}
