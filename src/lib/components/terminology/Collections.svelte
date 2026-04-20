<script lang="ts">
    import { terminologyStore } from "$lib/stores/terminologyService/TerminologyStore.svelte";
    import Input from "../ui/input/input.svelte";
    import type { ICollection } from "$lib/types/terminologyService";
    import Collection from "./Collection.svelte";
    import { Search } from "lucide-svelte";

    let inputValue = $state("");

    let searchResults: ICollection[] = $derived.by(() => {
        return terminologyStore.collections.filter((col) => col.label.toLowerCase().includes(inputValue.toLowerCase()));
    });
</script>

<div class="flex flex-col gap-2">
    <h2 class="w-full">{terminologyStore.collections.length} Collections loaded</h2>
    <div class="pb-4 relative flex items-center">
        <Search class="absolute left-2" />
        <Input aria-label={"Collection"} placeholder="Search Collection..." class="max-w-2/3 pl-10 text-lg" bind:value={inputValue}></Input>
    </div>

    {#each searchResults as collection}
        <Collection {collection} />
    {/each}
</div>
