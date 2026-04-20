<script lang="ts">
    import { goto } from "$app/navigation";
    import Mappings from "$lib/components/mapping/Mappings.svelte";
    import { Button } from "$lib/components/ui/button";
    import { downloadJson } from "$lib/services/arcs/arcFile.service";
    import { applicationStore } from "$lib/stores/application/ApplicationStore.svelte";
    import { mappingStore, type IMapping } from "$lib/stores/mapping/MappingStore.svelte";
    import { Download, Upload, X } from "lucide-svelte";
    import { toast } from "@zerodevx/svelte-toast";
    import { failure, success, warning } from "$lib/services/toasts/toastService";

    let fileInput: HTMLInputElement;

    /**
     * Import OBO Files
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

    function next() {
        applicationStore.stepState.mappingConfigured = true;
        goto("/map");
    }
</script>

<input class="hidden" type="file" accept="application/json,.mapping.json" bind:this={fileInput} onchange={handleChange} />

{#if mappingStore.mappingJson.length > 0}
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
