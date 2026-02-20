<script lang="ts">
    import { goto } from "$app/navigation";
    import { terminologyStore } from "$lib/stores/terminologyService/TerminologyStore.svelte";
    import type { Collection } from "$lib/types/terminologyService";
    import Button from "../ui/button/button.svelte";

    interface Props {
        collection: Collection;
        selectButton?: boolean;
    }

    let { collection, selectButton = true }: Props = $props();
</script>

<div class="grid grid-cols-8 shadow gap-4 p-4">
    <p class="col-span-2 font-bold">{collection.label}</p>
    <p class="col-span-6">{collection.description}</p>
    <div class="col-span-8 flex flex-wrap gap-2">
        {#each collection.terminologies as terminology}
            <p class="text-xs self-center text-center rounded-sm border border-gray-100 bg-secondary px-1">{terminology.label.toUpperCase()}</p>
        {/each}
    </div>

    {#if selectButton}
        <Button
            onclick={() => {
                terminologyStore.selectCollection(collection);
                goto("/");
            }}
            class="col-span-3">Select Collection</Button
        >
    {/if}
</div>
