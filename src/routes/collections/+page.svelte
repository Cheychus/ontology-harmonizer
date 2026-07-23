<script lang="ts">
    import { terminologyStore } from "$lib/stores/terminologyService/TerminologyStore.svelte";
    import { onMount } from "svelte";
    import type { PageProps } from "./$types";
    import Collections from "$lib/components/terminology/Collections.svelte";

    let { data }: PageProps = $props();

    $inspect(data);

    onMount(() => {
        terminologyStore.collections = data.collections;
    });
</script>

<Collections />
