<script lang="ts">
    import { pushToGitlab } from "$lib/services/arcs/arctrl";
    import { StatusStore } from "$lib/stores/status/StatusStore.svelte";
    import { onMount } from "svelte";
    import Button from "../ui/button/button.svelte";

    const status = new StatusStore();

    async function commit() {
        const res = await pushToGitlab();
        status.addStatusMsg("ARC was updated." + res.commitUrl);
    }
</script>

<div>Status: {status.getStatus().at(-1)}</div>

<Button
    onclick={async () => {
        commit();
    }}
    class="w-64"
    variant="outline">Push to Gitlab</Button
>
