<script lang="ts">
    import { goto } from "$app/navigation";
    import Mappings from "$lib/components/mapping/Mappings.svelte";
    import { Button } from "$lib/components/ui/button";
    import { downloadJson } from "$lib/services/arcs/arcFile.service";
    import { applicationStore } from "$lib/stores/application/ApplicationStore.svelte";
    import { mappingStore, type IMapping } from "$lib/stores/mapping/MappingStore.svelte";
    import { Download, Upload, X } from "lucide-svelte";
    import { success } from "$lib/services/toasts/toastService";
    import MappingFile from "$lib/components/mapping/MappingFile.svelte";
    import MappingSetMetadata from "$lib/components/mapping/MappingSetMetadata.svelte";
    import { onMount } from "svelte";
    import { parseSssomInServer } from "$lib/services/sssom/sssom";

    let fileInput: HTMLInputElement;
    const modules = import.meta.glob<IMapping[]>("$lib/assets/mappings/*.json", {
        eager: true,
        import: "default",
    });
    const files: IMapping[][] = Object.values(modules);

    /**
     * Import Files
     * @param event
     */
    async function handleChange(event: Event) {
        const input = event.target as HTMLInputElement;
        if (!input.files) return;
        const file = input.files[0];
        mappingStore.fileName = file.name;
        const mapping = await file.text();
        const mappingJson = (await JSON.parse(mapping)) as IMapping[];

        mappingStore.load(mappingJson);
        success("Mapping was uploaded");
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

    function selectBundledMapping(mappingFile: string, mappingJson: IMapping[]) {
        mappingStore.fileName = mappingFile.split("/").pop() ?? "mapping.json";
        mappingStore.load(mappingJson);
        success("Mapping was selected");
    }

    function next() {
        mappingStore.createMappingSet();
        applicationStore.stepState.mappingConfigured = true;
        goto("/map");
    }

    onMount(() => {});
</script>

<input class="hidden" type="file" accept="application/json,.mapping.json" bind:this={fileInput} onchange={handleChange} />

<!-- Here some example or official mappings should be loaded -->

<div class="w-full flex flex-wrap gap-2 pb-8">
    {#each Object.entries(modules) as [mappingFile, mappingJson]}
        <MappingFile
            name={mappingFile.split("/").pop() ?? mappingFile}
            size={mappingJson.length}
            onSelect={() => selectBundledMapping(mappingFile, mappingJson)}
        />
    {/each}
</div>

<input
    type="file"
    accept=".tsv"
    onchange={handleSssomChange}
/>

{#if mappingStore.hasMappingSet}
    <div class="w-full flex-1">
        <div class="flex gap-2 items-center pb-8">
            <h2>Mapping: {mappingStore.fileName.replace(".json", "")}</h2>
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
            <Button variant={"outline"} class="" onclick={() => fileInput.click()}><Upload />Upload mapping file</Button>
            <Button
                variant={"outline"}
                class=""
                onclick={() => downloadJson(mappingStore.mappingJson, mappingStore.fileName === "" ? "mapping.json" : mappingStore.fileName)}
                ><Download />Download mapping file</Button
            >
        </div>

        <MappingSetMetadata />

        <Mappings />
    </div>
{:else}
    <div class="w-full h-full min-h-full flex-1 flex flex-col gap-4 justify-center items-center">
        <div class="flex items-center gap-4">
            <Button variant={"secondary"} class="" onclick={() => fileInput.click()}><Upload />Upload Mapping file</Button>
            <Button variant="default" onclick={() => next()}>Create new Mapping</Button>
        </div>
        <p>You can upload an existing mapping here or skip this step and create a new mapping</p>
    </div>
{/if}
