<script lang="ts">
    import type { DerivedOntology } from "$lib/stores/arcs/ArcStore.svelte";
    import { mappingStore, type IMapping } from "$lib/stores/mapping/MappingStore.svelte";
    import { Search, LoaderCircle, ArrowLeft, ArrowRight } from "lucide-svelte";
    import { Input } from "../ui/input";
    import { Badge } from "../ui/badge";
    import { Button } from "../ui/button";
    import { Label } from "../ui/label";
    import * as Select from "$lib/components/ui/select/index.js";
    import type { IMatchingViewModel } from "../ontologies/Matchings.svelte";
    import { matchingStore, type IMatchingServiceData } from "$lib/stores/pythonService/MatchingStore.svelte";
    import type { matchingType } from "../ontologies/OntologyMapCard.svelte";
    import { searchTerms } from "$lib/api/terminology";
    import { terminologyStore } from "$lib/stores/terminologyService/TerminologyStore.svelte";
    import type { ITerminologySearchResult } from "$lib/types/terminologyService";
    import { iriToCurie } from "$lib/services/oboFiles/oboFile.service";
    import { onMount } from "svelte";
    import { settingsStore } from "$lib/stores/settings/SettingsStore.svelte";
    import { warning } from "$lib/services/toasts/toastService";
    import { Switch } from "../ui/switch";

    interface Props {
        currentOntology: DerivedOntology;
    }

    let { currentOntology }: Props = $props();

    let ontologySearchResults: IMatchingViewModel[] = $state([]);
    let searchResultIdx = $state(0);
    let currentSearchResult = $derived(ontologySearchResults?.[searchResultIdx] ?? null);

    let loading = $state(false);
    let noResults = $state(false);

    let selectValue = $derived("");
    let selectedMapping: IMapping | null = $state(null);
    let iriInput: string = $derived(currentSearchResult?.iri ?? "");
    let shortFormInput: string = $derived(iriToCurie(currentSearchResult?.shortForm ?? ""));

    // Derive select options from the existing obo file mapping terms
    const selectOptions = $derived.by(() => {
        return (
            mappingStore.mappingJson.map((m) => {
                return { value: m.name, label: m.name };
            }) ?? []
        );
    });
    const triggerContent = $derived(selectOptions.find((o) => o.value === selectValue)?.label ?? "Create a new mapping");

    let searchInput = $derived(currentOntology?.key ?? "");

    onMount(() => {
        if (settingsStore.automaticMatching) {
            getMatchings("terminology");
        }
        refocus();
    });

    function fromTerminology(result: ITerminologySearchResult): IMatchingViewModel {
        return {
            iri: result.iri,
            label: result.label,
            description: result.descriptions,
            shortForm: result.short_form,
            source: "terminology",
        };
    }

    function fromMatchingService(result: IMatchingServiceData): IMatchingViewModel {
        return {
            iri: result.id,
            label: result.label,
            description: result.definition,
            shortForm: result.short_id,
            rank: result.rank,
            score: result.score,
            source: "pythonService",
        };
    }

    async function getMatchings(method: matchingType) {
        loading = true;
        noResults = false;

        if (method === "terminology") {
            const result = (await searchTerms(fetch, searchInput, terminologyStore.selectedCollection?.id ?? "")) as ITerminologySearchResult[];
            // filter duplicate results with the same label + iri
            const unique = Array.from(new Map(result.map((r) => [`${r.label}-${r.iri}`, r])).values());
            ontologySearchResults = unique.map((r) => fromTerminology(r));
        } else if (method === "pythonService") {
            const result = await matchingStore.query(searchInput);
            ontologySearchResults = result.map((r) => fromMatchingService(r));
        }

        if (ontologySearchResults.length === 0) {
            noResults = true;
        }
        loading = false;
    }

    function switchSearchResult(change: number) {
        const newIdx = searchResultIdx + change;
        if (newIdx >= ontologySearchResults.length || newIdx < 0) {
            return;
        }
        searchResultIdx = newIdx;
    }

    function map() {
        if (!selectedMapping && (!iriInput || !shortFormInput)) {
            console.error("No Mapping defined. Please select a existing mapping or specify iri and short form");
            warning("IRI and Short Form required");
            return;
        }

        if (selectedMapping) {
            mappingStore.addSynonym(selectedMapping, currentOntology.key);
            selectedMapping.shortForm = shortFormInput;
        } else {
            const iri = iriInput;
            const label = currentSearchResult.label ?? currentOntology.key;
            const xref = shortFormInput;
            mappingStore.addMapping(label, iri, currentOntology.key, xref);
        }
        mappingStore.moveNext();
    }

    let container: HTMLElement;
    function refocus() {
        container?.focus();
    }
</script>

<div class="flex gap-2 pt-4">
    <Label>Automatic Search</Label>
    <Switch
        onCheckedChange={() => {
            if (settingsStore.automaticMatching) {
                getMatchings("terminology");
            }
            refocus();
        }}
        bind:checked={settingsStore.automaticMatching}
    />
</div>
<div
    bind:this={container}
    tabindex="0"
    role="button"
    class="min-h-112.5 max-h-112.5 flex flex-col flex-1 gap-2 shadow rounded-lg p-4 outline-none"
    onkeydown={(e) => {
        if (e.target instanceof HTMLInputElement) return;
        switch (e.key) {
            case "ArrowLeft":
                switchSearchResult(-1);
                break;
            case "ArrowRight":
                switchSearchResult(1);
                break;
            case "Enter":
                map();
                break;
            case "Escape":
                mappingStore.skip();
                break;
        }
    }}
>
    <div class="flex gap-2 items-center">
        <h3 class="min-w-0 max-w-full truncate whitespace-nowrap">{currentOntology.key}</h3>
        <Badge variant="outline" class="h-6">{currentOntology.ontologyAttribute}</Badge>
        {#if currentOntology.value !== ""}
            <Badge variant="outline" class="h-6"><a target="_blank" href={currentOntology.value}>{currentOntology.value}</a></Badge>
        {:else}
            <Badge variant="outline" class="h-6 ml-auto">ARC Value not defined</Badge>
        {/if}
        <Button variant="secondary" class="ml-auto" onclick={() => mappingStore.skip()}>Skip</Button>
    </div>
    <div class="flex gap-2 pt-2">
        <Button class="" onclick={() => getMatchings("terminology")} variant="secondary">Terminology Service <Search size={22} /></Button>
        <Button onclick={async () => getMatchings("pythonService")} variant="secondary">Matching Service <Search size={22} /></Button>

        <Input placeholder="search for a value..." bind:value={searchInput} />
    </div>

    <!-- <Label class="pt-2">Search Results</Label> -->
    <div class={{ "rounded-sm min-h-0 border border-border flex flex-col flex-1 ": true, "animate-puls": loading }}>
        {#if currentSearchResult}
            <div class="p-2 flex flex-col min-h-0 flex-1">
                <div class="flex justify-between shrink-0">
                    <h4>{currentSearchResult.label} - {iriToCurie(currentSearchResult.shortForm)}</h4>
                    <p class="font-bold">{searchResultIdx + 1}/{ontologySearchResults.length}</p>
                </div>

                <div class="flex-1 min-h-0 overflow-y-auto">
                    <ul class="list-disc pl-8 pr-2">
                        {#if currentSearchResult.description && currentSearchResult.description.length > 0}
                            {#each currentSearchResult.description as description}
                                <li class="py-1 break-all">{description}</li>
                            {/each}
                        {:else}
                            <li class="italic">No descriptions</li>
                        {/if}
                    </ul>
                </div>
            </div>

            <div class="mt-auto p-1 flex justify-between items-center">
                <Button class="w-32" variant="outline" size="icon" onclick={() => switchSearchResult(-1)}><ArrowLeft /></Button>

                <Button class="w-32" variant="outline" size="icon" onclick={() => switchSearchResult(1)}><ArrowRight /></Button>
            </div>
        {:else}
            <div class="flex items-center justify-center h-full flex-1">
                {#if loading}
                    <LoaderCircle class="animate-spin" />
                {:else if noResults}
                    <p class="text-muted-foreground">No results for {searchInput}</p>
                {:else}
                    <p class="text-muted-foreground">Search for ontologies or define the mapping manually</p>
                {/if}
            </div>
        {/if}
    </div>

    <div class="mt-auto flex flex-col w-full gap-2">
        <div class="flex gap-2 items-end w-full py-2">
            <div class="flex flex-col w-full gap-2">
                <Label for="iri-input">IRI</Label>
                <Input id="iri-input" placeholder="e.g. http://purl.obolibrary.org/obo/OBI_1234" bind:value={iriInput} />
            </div>

            <div class="flex flex-col gap-2 w-1/3">
                <Label for="iri-input">Short Form</Label>
                <Input id="iri-input" placeholder="e.g. OBI:1234" bind:value={shortFormInput} />
            </div>
        </div>

        <div class="flex gap-2">
            <Button class="w-1/3" onclick={() => map()}>Map</Button>

            <Select.Root
                type="single"
                bind:value={selectValue}
                onValueChange={() => {
                    selectedMapping = mappingStore.findMapping(selectValue)!;
                    shortFormInput = selectedMapping.shortForm;
                    iriInput = selectedMapping.iri;
                }}
            >
                <Select.Trigger class="w-full col-span-2">
                    {triggerContent}
                </Select.Trigger>
                <Select.Content>
                    <Select.Item value={"new-mapping"} label={"Create a new mapping"}></Select.Item>
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
        </div>
    </div>
</div>
