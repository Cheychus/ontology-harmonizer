<script lang="ts">
    import Input from "../ui/input/input.svelte";
    import Button from "../ui/button/button.svelte";
    import { arcStore, type DerivedOntology } from "$lib/stores/ArcStore.svelte";
    import { mapStore } from "$lib/stores/MapStore.svelte";
    import { onMount } from "svelte";

    let { i, name, ontology }: { i: number; name: string; ontology: DerivedOntology } = $props();

    let newValue: string = $state("");
    let ontoName: string = $state("");
    let ontos: any[] = $state([]);

    async function getOntos() {
        const response = await fetch(
            `https://terminology.services.base4nfdi.de/api-gateway/search?query=${ontoName}&collectionId=ea1e887f-fa72-44eb-8105-d966dbe6cd7f&display=short_form&display=descriptions&display=label`,
        );
        const data = await response.json();
        console.log(data);
        ontos = data;
    }
</script>

<div class="grid grid-cols-2 gap-2 shadow text-wrap break-all p-4 hover:bg-gray-50">
    <p>{i} - {name}</p>
    <div class="text-wrap">{ontology.value}</div>
    <Input bind:value={ontoName} />
    <Button onclick={getOntos}>GET ONTOS</Button>

    {#each ontos as onto}
        <div class="flex flex-col gap-2">
            <p><strong>{onto.label}</strong> ({onto.short_form})</p>
            <p>Description: {onto.descriptions.at(0)}</p>
        </div>
    {/each}
</div>
