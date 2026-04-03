<script lang="ts">
    import { mappingStore, type IMapping } from "$lib/stores/mapping/MappingStore.svelte";
    import { onMount } from "svelte";
    import Badge from "../ui/badge/badge.svelte";
    import { arcStore, type DerivedOntology } from "$lib/stores/arcs/ArcStore.svelte";
    import { ArrowRight, CircleCheck } from "lucide-svelte";
    import Label from "../ui/label/label.svelte";
    import { iriToCurie } from "$lib/services/oboFiles/oboFile.service";

    interface Props {
        ontology: DerivedOntology;
    }

    let { ontology }: Props = $props();

    let arcIri = $derived(ontology.source[ontology.ontologyAttribute] ?? "");
    let arcIris = $derived(arcStore.arcIriMap.get(ontology.key));
    let mapIri = $state("");
    let mapping: IMapping | null = $state(null);

    onMount(() => {
        arcIri = ontology.value;
        mapping = mappingStore.findMapping(ontology.key);

        mapIri = mapping?.iri ?? "";
    });
</script>

<div class="shadow p-2">
    <div class="flex gap-2 items-center col-span-2">
        <h3 class="">{ontology.key}</h3>
        <Badge variant="outline" class="h-6">{ontology.ontologyAttribute}</Badge>
        <div class="ml-auto">
            {#if arcIris && arcIris?.length > 1}
                <Badge variant="destructive">Multiple IRIs exist in ARC. Mapping will set new value!</Badge>
            {:else if arcIri === ""}
                <Badge class="bg-orange-400">Mapping will set ARC Value!</Badge>
            {:else if arcIri === mapIri}
                <CircleCheck class="text-green-400" />
            {:else if mapping && mappingStore.iriIncludesShortForm(arcIri, mapping.shortForm)}
                <div class="flex gap-2">
                    <Badge variant="outline">Mapping value and ARC value share the same short form.</Badge>
                    <CircleCheck class="text-green-400" />
                </div>
            {:else if arcIri !== mapIri}
                <Badge variant="destructive">Mapping will overwrite ARC IRI Value!</Badge>
            {/if}
        </div>
    </div>
    <div class="pt-3 flex gap-2 items-center">
        <div class="flex flex-col items-stretch">
            <Label class="p-1" for="arc-value">Mapping Value</Label>
            <p id="arc-value" class="border border-secondary rounded-md p-2">{mapIri}</p>
        </div>
        <ArrowRight class="translate-y-3" />
        <div class="flex flex-col">
            <Label class="p-1" for="arc-value">ARC Value</Label>
            {#each arcIris as iri}
                <p id="arc-value" class="min-h-10 min-w-64 border border-secondary rounded-md p-2 break-all">
                    {iri}
                    <!-- {o.value === "" ? "" : o.source[o.ontologyAttribute]} -->
                </p>
            {/each}
        </div>
    </div>
    <!-- <p>Map Curie: {mapCurie}</p> -->
</div>
