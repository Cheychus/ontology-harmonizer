<script lang="ts">
    import Input from "../ui/input/input.svelte";
    import Button from "../ui/button/button.svelte";
    import { arcStore, type DerivedOntology } from "$lib/stores/ArcStore.svelte";
    import { mapStore } from "$lib/stores/MapStore.svelte";
    import { onMount } from "svelte";
    import { searchTerms } from "$lib/api/terminology";
    import { terminologyStore } from "$lib/stores/terminologyService/TerminologyStore.svelte";
    import type { ITerminologySearchResult } from "$lib/types/terminologyService";
    import { LoaderCircle, Search } from "lucide-svelte";
    import Matchings from "./Matchings.svelte";
    import { oboFileStore } from "$lib/stores/oboFiles/OboFileStore.svelte";
    import * as Select from "$lib/components/ui/select/index.js";
    import type { OboSynonym } from "$lib/types/oboFiles";

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

    const selectOptions = $derived.by(() => {
        return (
            oboFileStore.oboJson?.terms.map((term) => {
                return { value: term.id, label: term.id + " - " + term.name };
            }) ?? []
        );
    });

    const triggerContent = $derived(selectOptions.find((o) => o.value === selectValue)?.label ?? "Choose a existing mapping term here");
    let selectValue = $derived("");

    function accept(data: ITerminologySearchResult | undefined) {
        if (data) {
            acceptOntology(data);
        } else {
            console.log("No search result, do something else");
        }
    }

    function acceptOntology(onto: ITerminologySearchResult) {
        console.log("hey: ", onto);
        //  const onto = ontologies[idx];
        const curie = onto.short_form.replace("_", ":");
        // Onto label im Mapping suchen (Synonyme, name)
        // Ist schon auf selectedValue, die ID
        const term = oboFileStore.oboJson?.terms.find((term) => term.id === selectValue);

        // Wenn kein Treffer: Neuen Term anlegen oder Auswahl Mapping (neues Synonym)
        if (!term) {
            const synName: string | null = name !== onto.label ? name : null;
            const syns: OboSynonym[] = synName
                ? [
                      {
                          synonymText: synName,
                          scopeIdentifier: "EXACT",
                      },
                  ]
                : [];

            const newTerm = oboFileStore.addTerm(onto.label, syns, [curie]);
            console.log("term added: ", newTerm);
        }
        // Wenn Treffer: onto.shortForm als CURIE der xref hinzufuegen (falls nicht vorhanden)
        // Oder synonym hinzufuegen fall noch nich existiert
        if (term && !term.xrefs.includes(curie)) {
            term.xrefs.push(curie);
            console.log("new curie added: ", curie);
        }
        if (term && !term.synonyms.find((syn) => syn.synonymText === name)) {
            const newSyn = oboFileStore.addSynonym(term, name);
            console.log("synonym added: ", newSyn);
        }
    }
</script>

<div class="grid grid-cols-2 gap-2 shadow text-wrap break-all p-4">
    <h3 class="col-span-2">{name}</h3>
    <Input bind:value={ontoName} />
    <Button onclick={getOntos} variant="secondary"
        >Search Ontologies <Search size={22} />
        {#if loading}<LoaderCircle class="animate-spin" />
        {/if}</Button
    >
    <!-- <Select.Root type="single" bind:value={selectValue}>
        <Select.Trigger class="w-full">
            {triggerContent}
        </Select.Trigger>
        <Select.Content>
            <Select.Item value={"new-term"} label={"Create a new term"}></Select.Item>
            <Select.Group>
                <Select.Label>Terms</Select.Label>
                {#each selectOptions as option}
                    <Select.Item value={option.value} label={option.label}>
                        {option.label}
                    </Select.Item>
                {/each}
            </Select.Group>
        </Select.Content>
    </Select.Root> -->

    <div class="col-span-2">
        <Matchings ontologies={ontos} {name} {accept} />
    </div>

    {#if noResults}
        <p class="italic">No Ontologies were found. Maybe try a different search term.</p>
    {/if}
</div>
