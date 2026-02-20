<script lang="ts">
    import { terminologyStore } from "$lib/stores/terminologyService/TerminologyStore.svelte";
    import Input from "../ui/input/input.svelte";
    import type { Collection } from "$lib/types/terminologyService";
    import CollectionComponent from "./CollectionComponent.svelte";

    let inputValue = $state("");

    let searchResults: Collection[] = $derived.by(() => {
        return terminologyStore.collections.filter((col) => col.label.toLowerCase().includes(inputValue.toLowerCase()));
    });
</script>

<div class="flex flex-col gap-2 py-16">
    <h2 class="w-full">{terminologyStore.collections.length} Collections loaded</h2>
    <div class="py-4">
        <Input aria-label={"Collection"} placeholder="Search Collection..." class="max-w-2/3 py-6" bind:value={inputValue} />
    </div>

    {#each searchResults as collection}
        <CollectionComponent {collection} />
    {/each}
</div>
