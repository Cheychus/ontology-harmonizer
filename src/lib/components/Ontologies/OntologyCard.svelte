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
    import Matchings from "./Matchings.svelte";

    let { i, name, ontology }: { i: number; name: string; ontology: DerivedOntology } = $props();

    let newValue: string = $state("");
    let ontoName: string = $state("");
    let ontos: ITerminologySearchResult[] = $state([]);

    let loading = $state(false);
    let noResults = $state(false);

    onMount(() => {
        ontoName = name;
    });

    async function getOntos() {
        loading = true;
        noResults = false;
        const result = await searchTerms(fetch, ontoName, terminologyStore.selectedCollection?.id ?? "");
        console.log(result);

        ontos = result;
        if (result.length === 0) {
            noResults = true;
        }
        loading = false;
    }
</script>

<div class="grid grid-cols-2 gap-2 shadow text-wrap break-all p-4">
    <h3>{i} - {name}</h3>
    <div class="text-wrap">{ontology.value}</div>
    <Input bind:value={ontoName} />
    <Button onclick={getOntos}
        >GET ONTOS {#if loading}<LoaderCircle class="animate-spin" />
        {/if}</Button
    >
    <div class="col-span-2">
        <Matchings ontologies={ontos} {name} />
    </div>

    {#if noResults}
        <p class="italic">No Ontologies were found. Maybe try a different search term.</p>
    {/if}
</div>
