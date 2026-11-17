<script lang="ts">
    import type { PageProps } from "./$types";
    import { Badge } from "$lib/components/ui/badge";
    import { Button } from "$lib/components/ui/button";
    import WorkflowFooter from "$lib/components/application/WorkflowFooter.svelte";
    import { Download, ExternalLink, LoaderCircle } from "lucide-svelte";
    import { arcStore } from "$lib/stores/arcs/ArcStore.svelte";
    import { mappingStore } from "$lib/stores/mapping/MappingStore.svelte";
    import { applicationStore } from "$lib/stores/application/ApplicationStore.svelte";
    import { createMappingReview } from "$lib/services/arcs/mappingReview";
    import { iriToCurie } from "$lib/services/sssom/curieMap";
    import { downloadJson } from "$lib/services/arcs/arcFile.service";
    import { failure, success } from "$lib/services/toasts/toastService";

    let { data }: PageProps = $props();
    let publishing = $state(false);
    let expandedValues = $state<string[]>([]);
    let rows = $derived(createMappingReview(arcStore.allOntologyValues, mappingStore.mappingSet, arcStore.changedOntologies));
    let pending = $derived(rows.reduce((sum, row) => sum + row.pending, 0));
    let applied = $derived(arcStore.changedOntologies.length);
    let withoutMapping = $derived(rows.filter((row) => row.targetValue === null).length);
    let canPublish = $derived(
        Boolean(data.user && !applicationStore.sessionExpired && arcStore.project && arcStore.arcProjectId === Number(arcStore.project.id) && !arcStore.project.archived),
    );
    let readyToSave = $derived(pending === 0 && (applied > 0 || rows.some((row) => row.targetValue !== null)));
    let resultStatus = $derived(
        publishing ? "Creating merge request..."
        : pending > 0 ? `${pending} pending updates`
        : arcStore.publishedResult ? "Merge request created"
        : applied > 0 ? `${applied} values updated`
        : readyToSave ? "ARC already matches the mapping"
        : "No mapped values to apply",
    );

    function applyMapping() {
        const count = arcStore.applyMapping();
        success(`${count} values updated in the loaded ARC`);
    }

    function downloadArc() {
        downloadJson(arcStore.json, "arc-ro-crate-metadata.json");
    }

    async function publish() {
        if (!canPublish || publishing || pending > 0 || applied === 0 || arcStore.publishedResult) return;
        publishing = true;
        const selectedJson = arcStore.json;
        const selectedProject = arcStore.arcProjectId;
        try {
            const { pushToGitlab } = await import("$lib/services/arcs/arctrl");
            if (arcStore.json !== selectedJson || arcStore.arcProjectId !== selectedProject) return;
            const result = await pushToGitlab();
            if (!result) {
                failure("Could not create the merge request. Please try again.");
                return;
            }
            if (arcStore.json === selectedJson && arcStore.arcProjectId === selectedProject) {
                arcStore.publishedResult = result;
            }
            success("Commit and merge request created");
        } catch (error) {
            failure(error instanceof Error ? error.message : "Could not create the merge request.");
        } finally {
            publishing = false;
        }
    }
</script>

<section class="flex w-full flex-1 flex-col gap-6">
    <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
            <h2>Apply changes</h2>
            <p class="text-sm text-muted-foreground">Review your changes, apply them to the loaded ARC, then download or save the result.</p>
        </div>
    </div>

    {#if !arcStore.initialised}
        <div class="flex flex-col items-start gap-4 rounded-lg border bg-card p-4 shadow-sm">
            <div>
                <h3>Select an ARC to review changes</h3>
                <p class="text-sm text-muted-foreground">Load an ARC before applying your mapping.</p>
            </div>
        </div>
    {:else if !mappingStore.hasMappingSet && applied === 0}
        <div class="flex flex-col items-start gap-4 rounded-lg border bg-card p-4 shadow-sm">
            <div>
                <h3>Configure a mapping to continue</h3>
                <p class="text-sm text-muted-foreground">Create or import a mapping to propose changes to this ARC.</p>
            </div>
        </div>
    {:else}
        <div class="min-w-0 rounded-lg border bg-card shadow-sm">
            <div class="flex flex-col gap-3 border-b p-4">
                <dl class="grid gap-3 text-sm sm:grid-cols-2">
                    <div>
                        <dt class="text-muted-foreground">ARC</dt>
                        <dd class="break-all font-medium">{arcStore.filename || "Loaded ARC"}</dd>
                    </div>
                    <div>
                        <dt class="text-muted-foreground">Mapping</dt>
                        <dd class="break-all font-medium">
                            {mappingStore.hasMappingSet ? mappingStore.fileName || "New mapping" : "Removed mapping"}
                        </dd>
                    </div>
                </dl>
                <div class="flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
                    <span>{withoutMapping} fields without mapping</span>
                </div>
            </div>

            {#if rows.length > 0}
                <div class="overflow-x-auto">
                    <table class="w-full min-w-[44rem] table-fixed text-left text-sm">
                        <thead class="border-b text-muted-foreground">
                            <tr>
                                <th scope="col" class="w-1/6 p-3 font-medium">Field</th>
                                <th scope="col" class="w-1/4 p-3 font-medium">Original ARC values</th>
                                <th scope="col" class="w-1/4 p-3 font-medium">New value</th>
                                <th scope="col" class="p-3 font-medium">Occurrences</th>
                                <th scope="col" class="p-3 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each rows as row (row.field)}
                                {@const expanded = expandedValues.includes(row.field)}
                                {@const preview = row.currentValues.map((value) => value || "Not defined").join("; ")}
                                {@const canExpand = preview.length > 80 || row.currentValues.length > 2}
                                {@const valuesId = `arc-values-${encodeURIComponent(row.field)}`}
                                <tr class="border-b align-top last:border-0">
                                    <th scope="row" class="break-words p-3 font-medium">{row.field}</th>
                                    <td class="space-y-1 p-3">
                                        <div id={valuesId}>
                                            {#if canExpand && !expanded}
                                                <p class="line-clamp-2 break-all">{preview}</p>
                                            {:else}
                                                {#each row.currentValues as value}
                                                    <p class="break-all">{value || "Not defined"}</p>
                                                {/each}
                                            {/if}
                                        </div>
                                        {#if canExpand}
                                            <Button
                                                variant="link"
                                                size="sm"
                                                class="h-auto px-0 py-1 text-xs"
                                                aria-expanded={expanded}
                                                aria-controls={valuesId}
                                                onclick={() =>
                                                    (expandedValues = expanded
                                                        ? expandedValues.filter((field) => field !== row.field)
                                                        : [...expandedValues, row.field])}>{expanded ? "Show less" : "Show more"}</Button
                                            >
                                        {/if}
                                    </td>
                                    <td class="break-all p-3">
                                        {#if row.targetValue}
                                            <a
                                                class="underline-offset-4 hover:underline"
                                                href={row.targetValue}
                                                target="_blank"
                                                rel="noreferrer"
                                                title={row.targetValue}>{iriToCurie(row.targetValue, mappingStore.mappingSet.metadata.curieMap)}</a
                                            >
                                        {:else}
                                            <span class="text-muted-foreground">No mapping</span>
                                        {/if}
                                    </td>
                                    <td class="p-3">{row.occurrences}</td>
                                    <td class="p-3">
                                        {#if row.pending > 0}
                                            <Badge variant="secondary">Pending</Badge>
                                            <p class="mt-1 text-xs text-muted-foreground">{row.pending} to update</p>
                                        {:else if row.applied > 0}
                                            <Badge variant="outline">Updated</Badge>
                                            <p class="mt-1 text-xs text-muted-foreground">{row.applied} updated</p>
                                        {:else}
                                            <span class="text-muted-foreground">{row.targetValue === null ? "Without mapping" : "Unchanged"}</span>
                                        {/if}
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            {:else}
                <p class="p-4 text-sm text-muted-foreground">No supported ontology fields were found in this ARC.</p>
            {/if}
        </div>

        <p class="text-sm text-muted-foreground">
            Applying updates the loaded ARC. DataHUB is only updated when you explicitly create a merge request.
        </p>
        {#if arcStore.publishedResult}
            <a class="inline-flex items-center gap-1 text-sm underline" href={arcStore.publishedResult.commitUrl} target="_blank" rel="noreferrer">View commit <ExternalLink class="size-3" /></a>
        {/if}
    {/if}

    <WorkflowFooter backHref="/map" backLabel="Back to mapping">
        {#snippet status()}
            {#if !arcStore.initialised}
                <p class="text-sm">Select an ARC to continue</p>
            {:else if !mappingStore.hasMappingSet && applied === 0}
                <p class="text-sm">Create or import a mapping to continue</p>
            {:else}
                <p class="text-sm font-medium">{resultStatus}</p>
                <p class="text-xs text-muted-foreground">
                    {pending > 0 ? "Review the table, then apply the updates."
                    : arcStore.publishedResult ? "Open the merge request or download the ARC."
                    : readyToSave && canPublish && applied > 0 ? "Download your result or create a merge request."
                    : readyToSave ? "Download the ARC to save your result."
                    : "Return to mapping to assign terms."}
                </p>
            {/if}
        {/snippet}
        {#snippet actions()}
            {#if !arcStore.initialised}
                <Button href="/select-arc">Select ARC</Button>
            {:else if !mappingStore.hasMappingSet && applied === 0}
                <Button href="/mapping">Configure mapping</Button>
            {:else if pending > 0}
                <Button disabled={publishing} onclick={applyMapping}>Apply to ARC</Button>
            {:else if arcStore.publishedResult}
                <Button variant="outline" disabled={!readyToSave} onclick={downloadArc}><Download />Download ARC</Button>
                <Button href={arcStore.publishedResult.mergeUrl} target="_blank" rel="noreferrer">View merge request <ExternalLink class="size-3" /></Button>
            {:else if canPublish && applied > 0}
                <Button variant="outline" disabled={!readyToSave || publishing} onclick={downloadArc}><Download />Download ARC</Button>
                <Button disabled={publishing} onclick={publish}>
                    {#if publishing}<LoaderCircle class="animate-spin" />{/if}
                    {publishing ? "Creating merge request..." : "Create merge request"}
                </Button>
            {:else}
                <Button disabled={!readyToSave} onclick={downloadArc}><Download />Download ARC</Button>
            {/if}
        {/snippet}
    </WorkflowFooter>
</section>
