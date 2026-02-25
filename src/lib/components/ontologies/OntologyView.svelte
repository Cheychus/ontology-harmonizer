<script lang="ts">
    import type { DerivedOntology } from "$lib/stores/ArcStore.svelte";
    import { oboFileStore } from "$lib/stores/oboFiles/OboFileStore.svelte";
    import type { SvelteMap } from "svelte/reactivity";
    import Button from "../ui/button/button.svelte";
    import { Map } from "lucide-svelte";
    import { goto } from "$app/navigation";
    import OntologyCard from "./OntologyCard.svelte";

    interface Props {
        ontologies: SvelteMap<string, DerivedOntology>;
    }

    let { ontologies }: Props = $props();

    let derivedOntos = $derived(ontologies.values().toArray());
    let mappedOntos = $derived(derivedOntos.filter((onto) => oboFileStore.findTermByName(onto.key)));
    let unmappedOntos = $derived(derivedOntos.filter((onto) => oboFileStore.findTermByName(onto.key) === null));

    // $inspect(unmappedOntos);
    // $inspect(mappedOntos);
    // $inspect(oboFileStore.oboJson);
</script>

<h2 class="underline py-2">Mapped OBO - ARC ({mappedOntos.length})</h2>
<div class="flex flex-col gap-2">
    {#each mappedOntos as ontology (ontology.key)}
        <div class="shadow p-2">
            <h4>Name: {ontology.key}</h4>
            <p>ARC Value: {ontology.value}</p>
            <p>OBO ID: {oboFileStore.findTermByName(ontology.key)?.id}</p>
            <p>OBO xrefs: {oboFileStore.findTermByName(ontology.key)?.xrefs.join(", ")}</p>
        </div>
    {/each}
</div>

<div class="flex gap-4 items-center">
    <h2 class="underline py-2">Unmapped OBO - ARC ({unmappedOntos.length})</h2>
</div>

<div class="flex flex-col gap-2">
    {#each unmappedOntos as ontology, i (ontology.key)}
        <OntologyCard {i} name={ontology.key} {ontology} />
    {/each}
</div>
