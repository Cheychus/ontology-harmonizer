<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import { downloadJson } from "$lib/services/arcs/arcFile.service";
    import { pushToGitlab } from "$lib/services/arcs/arctrl";
    import { failure, success } from "$lib/services/toasts/toastService";
    import { applicationStore } from "$lib/stores/application/ApplicationStore.svelte";
    import { arcStore } from "$lib/stores/arcs/ArcStore.svelte";
    import { mappingStore } from "$lib/stores/mapping/MappingStore.svelte";
    import { Download, Minus, Plus } from "lucide-svelte";
    import { onMount } from "svelte";

    let commitUrl = $state("");
    let mergeUrl = $state("");
    let commited = $state(false);
    let loading = $state(false);

    async function commit() {
        if (!applicationStore.isAuthenticated) {
            failure("Not authenticated");
            return;
        }

        const res = await pushToGitlab();
        if (res) {
            commitUrl = res.commitUrl;
            mergeUrl = res.mergeUrl;
            commited = true;
            success("Commit was successfull");
        } else {
            failure("Commit failed");
        }
    }

    onMount(() => {
        commited = false;
    });
</script>

{#if arcStore.changedOntologies.length > 0}
    <section class="flex flex-col gap-2">
        <h2>GitLab Commit</h2>

        <div>
            Review your changes, then create a GitLab commit and merge request. The GitLab pipeline generates an updated ARC-RO-Crate JSON; when you
            import it again, some ontology values may have changed.
        </div>

        <div class="flex gap-2">
            <Button
                onclick={async () => {
                    commit();
                }}
                class="w-64"
                variant="default"
                >Push to Gitlab
            </Button>
            <Button
                onclick={() => downloadJson(mappingStore.mappingJson, mappingStore.fileName === "" ? "mapping.json" : mappingStore.fileName)}
                class="ml-auto"
                variant="secondary"><Download /> Save Mapping</Button
            >
        </div>

        <div class="flex flex-col">
            {#if commited}
                <p>Your ARC was commited successfully. View the commit here: <a target="_blank" href={commitUrl}>{commitUrl}</a></p>
                <p>Or go directly to the automatically generated merge request: <a target="_blank" href={mergeUrl}>{mergeUrl}</a></p>
            {/if}
        </div>

        <h3>Changes ({arcStore.changedOntologies.length})</h3>
        <p>Those ARC values will be changed</p>
        <table class="w-full border border-secondary border-collapse">
            <thead>
                <tr class="border-b">
                    <th class="border-r p-2 text-left">Label</th>
                    <th class="border-r p-2 text-left">Old Value</th>
                    <th class="p-2 text-left">New Value</th>
                </tr>
            </thead>
            <tbody>
                {#each arcStore.changedOntologies as changed}
                    <tr class="border-b">
                        <td class="border-r p-2 font-bold">
                            {changed.old.key}
                        </td>

                        <td class="border-r p-2 text-sm">
                            <div class="flex gap-1 items-center break-all">
                                <Minus class="text-red-400" size={16} />
                                {changed.old.value}
                            </div>
                        </td>

                        <td class="p-2 text-sm">
                            <div class="flex gap-1 items-center">
                                <Plus class="text-green-400" size={16} />
                                {changed.new}
                            </div>
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </section>
{:else}
    <div class="w-full h-full flex-1 flex flex-col gap-4 items-center justify-center">
        <Button class="px-16" href="/apply">Apply Mapping</Button>
        <p>No changes were made. Apply a mapping first on your selected ARC</p>
    </div>
{/if}
