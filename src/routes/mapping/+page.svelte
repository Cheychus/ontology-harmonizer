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
    import { Download, Upload } from "lucide-svelte";
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

<section class="flex w-full flex-1 flex-col gap-6">
    <div>
        <div class="flex flex-wrap items-center justify-between gap-3">
            <h2>Configure mapping</h2>
            {#if mappingStore.hasMappingSet}
                <Button href={arcStore.initialised ? "/map" : "/select-arc"}>{arcStore.initialised ? "Start mapping" : "Select ARC"}</Button>
            {/if}
        </div>
        <p class="text-sm text-muted-foreground">Create a new mapping or import an existing SSSOM file, review its details, then start mapping.</p>
    </div>

    {#if !mappingStore.hasMappingSet}
        <div class="grid gap-4 sm:grid-cols-2">
            <div class="flex flex-col gap-4 rounded-lg border bg-card p-4 shadow-sm">
                <div>
                    <h3>New mapping</h3>
                    <p class="text-sm text-muted-foreground">Start with an empty mapping and the application defaults.</p>
                </div>
                <Button class="mt-auto self-start" variant="outline" onclick={createMapping}>Create mapping</Button>
            </div>
            <div class="flex flex-col gap-4 rounded-lg border bg-card p-4 shadow-sm">
                <div>
                    <h3>Import mapping</h3>
                    <p class="text-sm text-muted-foreground">Continue working with an existing SSSOM TSV file.</p>
                </div>
                <div class="mt-auto flex flex-wrap items-center gap-2">
                    <Button variant="outline" onclick={() => sssomFileInput.click()}><Upload />Import SSSOM TSV</Button>
                    <Button variant="ghost" title="Import JSON as a fallback" onclick={() => jsonFileInput.click()}><Upload />JSON</Button>
                </div>
            </div>
        </div>
    {/if}

    {#if mappingStore.hasMappingSet}
        <article class="w-full min-w-0 rounded-lg border bg-card shadow-sm" aria-labelledby="mapping-file-name">
            <header class="flex flex-wrap items-center gap-3 border-b p-4">
                <div class="min-w-0">
                    <h3 id="mapping-file-name" class="break-all font-medium">{mappingStore.fileName || "New mapping"}</h3>
                    <p class="text-sm text-muted-foreground">{mappingStore.mappingSet.mappings.length} mapping entries</p>
                </div>
                <div class="ml-auto flex flex-wrap items-center justify-end gap-2">
                    <Button variant="outline" size="sm" onclick={exportMapping}><Download />SSSOM TSV</Button>
                    <Button variant="ghost" size="sm" title="Download JSON as a fallback" onclick={exportJsonMapping}><Download />JSON</Button>
                    <Button
                        onclick={() => {
                            if (!window.confirm("Remove this mapping? Any mapping changes that have not been downloaded will be lost.")) return;
                            mappingStore.reset();
                            success("Mapping was removed");
                        }}
                        variant="destructive"
                        size="sm">Remove mapping</Button
                    >
                </div>
            </header>

            <section class="flex flex-col gap-4 border-b p-4">
                <ContributorEditor bind:contributors={applicationStore.defaultMappingContributors}>
                    {#snippet header()}
                        <div>
                            <div class="flex items-center gap-2">
                                <h3>Mapping contributors</h3>
                                <HelpHint helpKey="mappingContributors" />
                            </div>
                            <p class="text-sm text-muted-foreground">Default contributors for newly created mappings.</p>
                        </div>
                    {/snippet}
                </ContributorEditor>
            </section>

            <MappingSetMetadata />

            <SssomMappings embedded />
        </article>
    {/if}
</section>
