<script lang="ts">
    import { goto, invalidate } from "$app/navigation";
    import Button from "$lib/components/ui/button/button.svelte";
    import { terminologyStore } from "$lib/stores/terminologyService/TerminologyStore.svelte";
    import { onMount } from "svelte";
    import type { PageProps } from "./$types";
    import { getCollections } from "$lib/api/terminology";
    import Collection from "$lib/components/terminology/Collection.svelte";
    import Collections from "$lib/components/terminology/Collections.svelte";

    let { data }: PageProps = $props();

    $inspect(data);

    onMount(() => {
        terminologyStore.collections = data.collections;
    });

    $inspect(terminologyStore.collections);
</script>

<Collections />
