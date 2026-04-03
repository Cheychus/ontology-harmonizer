<script lang="ts">
    import Badge from "$lib/components/ui/badge/badge.svelte";
    import { Button } from "$lib/components/ui/button";
    import { pushToGitlab } from "$lib/services/arcs/arctrl";
    import { arcStore } from "$lib/stores/arcs/ArcStore.svelte";
    import { ArrowRight } from "lucide-svelte";
    import { onMount } from "svelte";

    let commitUrl = $state("");
    let mergeUrl = $state("");
    let commited = $state(false);

    async function commit() {
        const res = await pushToGitlab();
        commitUrl = res.commitUrl;
        mergeUrl = res.mergeUrl;
        commited = true;
    }

    onMount(() => {
        commited = false;
        console.log(arcStore.ontologyCandidates.size);
    });
</script>

<section class="flex flex-col gap-2">
    <h2>GitLab Commit</h2>

    <div>
        Here you can commit your changes directly to GitLab. View the changes first and then press the button to create a new commit and merge
        request. After commiting, the Gitlab Pipeline will automatically run a pipeline to create a new ARC RO CRATE JSON. Some Ontology values can be
        replaced by this process, so if you import the ARC again, some values may have changed.
    </div>

    <Button
        onclick={async () => {
            commit();
        }}
        class="w-64"
        variant="outline"
        >Push to Gitlab
    </Button>

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
                    <td class="border-r p-2 font-bold">{changed.old.key}</td>
                    <td class="border-r p-2 text-sm">{changed.old.value}</td>
                    <td class="p-2 text-sm">{changed.new}</td>
                </tr>
            {/each}
        </tbody>
    </table>
</section>
