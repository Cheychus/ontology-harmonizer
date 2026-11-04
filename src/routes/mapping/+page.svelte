<script lang="ts">
    import type { PageProps } from "./$types";
    import type { IGitLabUser } from "$lib/types/gitLab";
    import { onMount } from "svelte";
    import HelpHint from "$lib/components/HelpHint.svelte";
    import ContributorEditor from "$lib/components/mapping/ContributorEditor.svelte";
    import { Button } from "$lib/components/ui/button";
    import { applicationStore } from "$lib/stores/application/ApplicationStore.svelte";
    import { mappingStore } from "$lib/stores/mapping/MappingStore.svelte";
    import { arcStore } from "$lib/stores/arcs/ArcStore.svelte";
    import { Download, Upload, X } from "lucide-svelte";
    import { failure, success } from "$lib/services/toasts/toastService";
    import MappingSetMetadata from "$lib/components/mapping/MappingSetMetadata.svelte";
    import SssomMappings from "$lib/components/mapping/SssomMappings.svelte";
    import { parseSssomInServer } from "$lib/services/sssom/parseSssomTsvData";
    import { parseMappingSetJson } from "$lib/services/sssom/parseMappingSetJson";
    import { exportMapping } from "$lib/services/sssom/serializeSssomTsv";
    import { downloadJson } from "$lib/services/arcs/arcFile.service";

    let { data }: PageProps = $props();

    /**
     * Fill the first default Author with user data from GitLab if not already filled with data.
     * @param user
     */
    function loadContributorWithUserData(user: IGitLabUser) {
        const profileAuthor = applicationStore.defaultMappingContributors.find((contributor) => contributor.role === "author");
        if (!profileAuthor) return;

        if (!profileAuthor.id?.trim()) {
            const email = (user.email || user.commit_email || "").trim();
            profileAuthor.id = email ? `mailto:${email}` : "";
        }
    }

    onMount(() => {
        if (data.user) loadContributorWithUserData(data.user);
    });

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

    function exportJsonMapping() {
        const fileName = mappingStore.fileName.endsWith(".json") ? mappingStore.fileName : "mapping.json";
        downloadJson(mappingStore.mappingSet, fileName);
    }

    function createMapping() {
        mappingStore.createMappingSet();
        applicationStore.stepState.mappingConfigured = true;
    }
</script>

<input class="hidden" type="file" accept=".tsv,text/tab-separated-values" bind:this={sssomFileInput} onchange={handleSssomChange} />
<input class="hidden" type="file" accept=".json,application/json" bind:this={jsonFileInput} onchange={handleJsonChange} />

{#if mappingStore.hasMappingSet}
    <div class="w-full flex-1">
        <div class="flex gap-2 items-center pb-8">
            <h2>Mapping: {mappingStore.fileName || "New mapping"}</h2>
            <Button
                onclick={() => {
                    mappingStore.reset();
                    success("Mapping was removed");
                }}
                variant="destructive"
                size="icon-sm"
                class="flex items-center"><X /></Button
            >

            <Button class="ml-auto px-16" href={arcStore.initialised ? "/map" : "/select-arc"} size="lg">{arcStore.initialised ? "Start mapping" : "Select ARC"}</Button>
        </div>
        <div class="flex gap-2 pb-2">
            <Button variant="outline" onclick={() => sssomFileInput.click()}><Upload />SSSOM TSV</Button>
            <Button onclick={exportMapping}><Download />SSSOM TSV</Button>
            <Button variant="ghost" title="Import JSON as a fallback" onclick={() => jsonFileInput.click()}><Upload />JSON</Button>
            <Button variant="ghost" title="Download JSON as a fallback" onclick={exportJsonMapping}><Download />JSON</Button>
        </div>

        <MappingSetMetadata />

        <section class="mb-6 flex flex-col gap-4 rounded-lg border bg-card p-4 shadow-sm">
            <div>
                <div class="flex items-center gap-2">
                    <h3>Mapping contributors</h3>
                    <HelpHint helpKey="mappingContributors" />
                </div>
                <p class="text-sm text-muted-foreground">Default contributors for newly created mappings.</p>
            </div>
            <ContributorEditor bind:contributors={applicationStore.defaultMappingContributors} />
        </section>

        <SssomMappings />
    </div>
{:else}
    <div class="w-full h-full min-h-full flex-1 flex flex-col gap-4 justify-center items-center">
        <div class="flex items-center gap-4">
            <Button variant="secondary" onclick={() => sssomFileInput.click()}><Upload />SSSOM TSV</Button>
            <Button variant="ghost" title="Import JSON as a fallback" onclick={() => jsonFileInput.click()}><Upload />JSON</Button>
            <Button variant="default" onclick={createMapping}>Create new mapping</Button>
        </div>
        <p>Import an existing mapping or create a new one to configure its metadata.</p>
    </div>
{/if}
