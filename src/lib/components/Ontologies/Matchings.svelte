<script lang="ts">
    import type { ITerminologySearchResult } from "$lib/types/terminologyService";
    import { ArrowLeft, ArrowRight, Check, Minus, Plus } from "lucide-svelte";
    import Button from "../ui/button/button.svelte";
    import Matching from "./Matching.svelte";
    import * as Select from "$lib/components/ui/select/index.js";
    import { oboFileStore } from "$lib/stores/oboFiles/OboFileStore.svelte";
    import type { OboSynonym, OboTerm } from "$lib/types/oboFiles";
    import Input from "../ui/input/input.svelte";
    import { curieToIri, iriToCurie } from "$lib/services/oboFiles/oboFile.service";

    interface Props {
        ontologies: ITerminologySearchResult[];
        name: string;
        accept: any;
    }

    let { ontologies, name, accept }: Props = $props();

    let listView = $state(false);
    let idx = $derived(ontologies.length / ontologies.length - 1); // dervied to reset the idx when ontologies are updated
    let showSelect = $state(false);
    let currentOntology = $derived(ontologies[idx]);

    function findMappingId() {
        const onto = ontologies[idx];
        const term = oboFileStore.findTermByName(onto.label);

        if (term) {
            return term;
        }
        return null;
    }

    function acceptOntology() {
        const onto = ontologies[idx];
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

    const selectOptions = $derived.by(() => {
        return (
            oboFileStore.oboJson?.terms.map((term) => {
                return { value: term.id, label: term.id + " - " + term.name };
            }) ?? []
        );
    });

    let selectValue = $derived("");
    let selectedTerm: OboTerm | null = $state(null);

    const triggerContent = $derived(selectOptions.find((o) => o.value === selectValue)?.label ?? "Create a new mapping term");

    // $inspect(selectOptions);

    let referenceInput: string = $derived(iriToCurie(ontologies[idx]?.short_form ?? ""));

    function mapOntology() {
        if (selectedTerm) {
            oboFileStore.addSynonym(selectedTerm, name);
            oboFileStore.addXref(selectedTerm, referenceInput);
        } else {
            let xref = referenceInput;
            oboFileStore.mapOntology(currentOntology?.label ?? name, name, xref);
        }
    }

    // $inspect(selectValue, referenceInput);
    $inspect("onto", currentOntology);
</script>

<div class="flex flex-col gap-2">
    {#if listView}
        <p class="font-bold">Matches: {ontologies.length}</p>
        {#each ontologies as ontology}
            <Matching {ontology} />
        {/each}
    {:else if ontologies.length > 0}
        <div class="flex justify-between gap-4 items-center">
            <Button class="w-32" variant="outline" size="icon" onclick={() => (idx = idx - 1 < 0 ? idx : idx - 1)}><ArrowLeft /></Button>
            <!-- <Button variant="default" size="lg" class="px-16" onclick={() => acceptOntology()}>Accept <Check size={20} /></Button> -->
            <p class="font-bold">Match: {idx + 1} / {ontologies.length}</p>
            <Button class="w-32" variant="outline" size="icon" onclick={() => (idx = idx + 1 >= ontologies.length ? idx : idx + 1)}
                ><ArrowRight /></Button
            >
        </div>

        <Matching ontology={ontologies[idx]} />
        <div class="flex">
            {#if false}
                <Select.Root type="single" bind:value={selectValue}>
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
                </Select.Root>
            {/if}
        </div>
    {/if}
    <div class="grid grid-cols-2 w-full gap-2">
        <Select.Root
            type="single"
            bind:value={selectValue}
            onValueChange={() => {
                selectedTerm = oboFileStore.findTermById(selectValue);
                referenceInput = selectedTerm?.xrefs.join(", ") ?? referenceInput;
            }}
        >
            <Select.Trigger class="w-full col-span-2">
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
        </Select.Root>
        <Input placeholder="Manually define reference e.g. OBI:00001" bind:value={referenceInput} />
        <Button class="" onclick={() => mapOntology()}>Map</Button>
    </div>
</div>
