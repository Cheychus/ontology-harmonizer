<script lang="ts">
    import Input from "../ui/input/input.svelte";
    import Button from "../ui/button/button.svelte";
    import { arcStore, type DerivedOntology } from "$lib/stores/ArcStore.svelte";
    import { mapStore } from "$lib/stores/MapStore.svelte";
    import { onMount } from "svelte";
    import { searchTerms } from "$lib/api/terminology";
    import { terminologyStore } from "$lib/stores/terminologyService/TerminologyStore.svelte";
    import type { ITerminologySearchResult } from "$lib/types/terminologyService";
    import { LoaderCircle } from "lucide-svelte";

    let { i, name, ontology }: { i: number; name: string; ontology: DerivedOntology } = $props();

    let newValue: string = $state("");
    let ontoName: string = $state("");
    let ontos: ITerminologySearchResult[] = $state([]);

    let loading = $state(false);

    onMount(() => {
        ontoName = name;
    });

    async function getOntos() {
        loading = true;
        const result = await searchTerms(fetch, ontoName, terminologyStore.selectedCollection?.id ?? "");
        console.log(result);

        ontos = result;
        loading = false;
    }
</script>

<div class="grid grid-cols-2 gap-2 shadow text-wrap break-all p-4 hover:bg-gray-50">
    <p>{i} - {name}</p>
    <div class="text-wrap">{ontology.value}</div>
    <Input bind:value={ontoName} />
    <Button onclick={getOntos}
        >GET ONTOS {#if loading}<LoaderCircle class="animate-spin" />
        {/if}</Button
    >

    {#each ontos as onto}
        <div class="flex flex-col gap-2">
            <p><strong>{onto.label}</strong> ({onto.short_form})</p>
            {#each onto.descriptions as description, index}
                <p>Description[{index}]: {description}</p>
            {/each}
        </div>
    {/each}
</div>
