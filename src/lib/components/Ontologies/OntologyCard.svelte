<script lang="ts">
    import Input from "../ui/input/input.svelte";
    import Button from "../ui/button/button.svelte";
    import { arcStore, type DerivedOntology } from "$lib/stores/ArcStore.svelte";
    import { mapStore } from "$lib/stores/MapStore.svelte";

    let { i, name, ontology }: { i: number; name: string; ontology: DerivedOntology } = $props();

    let newValue: string = $state("");
</script>

<div class="grid grid-cols-2 gap-2 shadow text-wrap break-all p-4">
    <p>{i} - {name}</p>
    <div class="text-wrap">{ontology.value}</div>
</div>
