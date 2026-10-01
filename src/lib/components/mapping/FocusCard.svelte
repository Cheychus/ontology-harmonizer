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
    import { searchTerms, terminologyProviders } from "$lib/api/terminology";
    import { terminologyStore } from "$lib/stores/terminologyService/TerminologyStore.svelte";
    import type { ITerminologySearchResult, matchingType } from "$lib/types/terminologyService";
    import { iriToCurie } from "$lib/services/oboFiles/oboFile.service";
    import { onMount } from "svelte";
    import { settingsStore } from "$lib/stores/settings/SettingsStore.svelte";
    import { failure, warning } from "$lib/services/toasts/toastService";
    import { Switch } from "../ui/switch";
    import SSSOMInput from "./SSSOM_Input.svelte";
    import type { SssomMapping } from "$lib/types/mapping";

    $inspect(mappingStore.mappingSet);

    interface Props {
        currentOntology: DerivedOntology;
    }

    let { currentOntology }: Props = $props();

    let ontologySearchResults: IMatchingViewModel[] = $state([]);
    let searchResultIdx = $state(0);
    let currentSearchResult = $derived(ontologySearchResults?.[searchResultIdx] ?? null);

    let loading = $state(false);
    let noResults = $state(false);
    let activeSearch: AbortController | null = null;
    let searchId = 0;

    let selectValue = $derived("");
    let selectedMapping: IMapping | null = $state(null);
    let iriInput: string = $derived(currentSearchResult?.iri ?? "");
    let shortFormInput: string = $derived(iriToCurie(currentSearchResult?.shortForm ?? ""));
    let curieMapPrefix = $state("");
    let curieMapBaseIri = $state("");
    let curieMapDetailsAccepted = $state(false);

    // Derive select options from the existing obo file mapping terms
    const selectOptions = $derived.by(() => {
        return (
            mappingStore.mappingJson.map((m) => {
                return { value: m.name, label: m.name };
            }) ?? []
        );
    });
    const triggerContent = $derived(selectOptions.find((o) => o.value === selectValue)?.label ?? "Create a new mapping");
    const terminologyProviderLabel = $derived(
        terminologyProviders.find((provider) => provider.id === settingsStore.terminologyProvider)?.label ?? "Select a terminology service",
    );

    let searchInput = $derived(currentOntology?.key ?? "");
    let sssomMapping = $state<SssomMapping>({
        subjectId: "",
        subjectLabel: "",
        predicateId: "skos:exactMatch",
        objectId: "",
        objectLabel: "",
        mappingJustification: "semapv:ManualMappingCuration",
        confidence: 1,
        comment: "",
        authorIds: [],
    });

    // Keep the SSSOM mapping in sync with the current Focus Card ontology values and search results.
    $effect(() => {
        sssomMapping.subjectId = mappingStore.subjectIdentifier.prefix ? `${mappingStore.subjectIdentifier.prefix}:${currentOntology.key}` : "";
        sssomMapping.subjectLabel = currentOntology.key;
        sssomMapping.objectLabel = currentSearchResult?.label ?? "";
    });

    onMount(() => {
        if (settingsStore.automaticMatching) {
            getMatchings(settingsStore.matchingMethod);
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
            shortForm: result.short_form,
            rank: result.rank,
            score: result.score,
            source: "pythonService",
        };
    }

    async function getMatchings(method: matchingType) {
        activeSearch?.abort();
        const controller = new AbortController();
        activeSearch = controller;
        const currentSearchId = ++searchId;

        loading = true;
        noResults = false;
        searchResultIdx = 0;
        ontologySearchResults = [];
        try {
            let results: IMatchingViewModel[] = [];

            if (method === "terminology") {
                const result = (await searchTerms(
                    fetch,
                    settingsStore.terminologyProvider,
                    searchInput,
                    terminologyStore.selectedCollection?.id ?? "",
                    controller.signal,
                )) as ITerminologySearchResult[];

                // filter duplicate results with the same label + iri
                const unique = Array.from(new Map(result.map((r) => [`${r.label}-${r.iri}`, r])).values());
                results = unique.map((r) => fromTerminology(r));
            } else if (method === "pythonService") {
                const result = await matchingStore.query(searchInput.toLowerCase(), controller.signal);
                results = result.map((r) => fromMatchingService(r));
            }

            // A provider may still resolve after being aborted. Only the newest search may update the UI.
            if (currentSearchId !== searchId) return;

            ontologySearchResults = results;
            if (results.length === 0) {
                noResults = true;
            }
        } catch (e) {
            if (controller.signal.aborted) return;
            failure(`Failed to fetch ontology values [${e}]`);
        } finally {
            if (currentSearchId === searchId) {
                loading = false;
                activeSearch = null;
            }
        }
    }

    function switchSearchResult(change: number) {
        const newIdx = searchResultIdx + change;
        if (newIdx >= ontologySearchResults.length || newIdx < 0) {
            return;
        }
        searchResultIdx = newIdx;
    }

    function addSssomMapping() {
        if (!mappingStore.subjectIdentifier.prefix) {
            warning("Choose a subject prefix before creating mappings");
            return;
        }
        if (!selectedMapping && (!iriInput || !shortFormInput)) {
            warning("IRI and Short Form required");
            return;
        }
        if (selectedMapping) {
        }

        const mappingSuccess = mappingStore.addSssomMapping(sssomMapping);

        if (mappingSuccess) {
            if (curieMapDetailsAccepted) {
                mappingStore.addCurieMapEntry(curieMapPrefix, curieMapBaseIri);
            }
            mappingStore.moveNext();
        }
    }

    function map() {
        if (!selectedMapping && (!iriInput || !shortFormInput)) {
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

<div class="flex gap-2 pt-4 items-center">
    <Select.Root type="single" name="terminologyProvider" bind:value={settingsStore.terminologyProvider}>
        <Select.Trigger class="w-64">
            {terminologyProviderLabel}
        </Select.Trigger>
        <Select.Content>
            <Select.Group>
                <Select.Label>Terminology service</Select.Label>
                {#each terminologyProviders as provider (provider.id)}
                    <Select.Item value={provider.id} label={provider.label}>{provider.label}</Select.Item>
                {/each}
            </Select.Group>
        </Select.Content>
    </Select.Root>
    <Label>Automatic Search</Label>
    <Switch
        onCheckedChange={() => {
            if (settingsStore.automaticMatching) {
                getMatchings(settingsStore.matchingMethod);
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
    class="min-h-200 flex flex-col flex-1 gap-2 shadow rounded-lg p-4 outline-none"
    onkeydown={(e) => {
        // Allows user to handle mapping with the keyboard
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
    <div class="flex min-w-0 gap-2 items-center">
        <h3 class="basis-1/3 min-w-0 shrink-0 truncate whitespace-nowrap">
            {currentOntology.key}
        </h3>

        <Badge variant="outline" class="h-6 shrink-0">
            {currentOntology.ontologyAttribute}
        </Badge>

        {#if currentOntology.value !== ""}
            <Badge variant="outline" class="h-6 min-w-0 flex-initial">
                <a target="_blank" class="block truncate" href={currentOntology.value} title={currentOntology.value}>
                    {currentOntology.value}
                </a>
            </Badge>
        {:else}
            <Badge variant="outline" class="h-6 min-w-0">ARC Value not defined</Badge>
        {/if}

        <Button variant="secondary" class="shrink-0 ml-auto" onclick={() => mappingStore.skip()}>Skip</Button>
    </div>
    <div class="flex gap-2 pt-2">
        <Button class="" onclick={() => getMatchings("terminology")} variant="secondary">{terminologyProviderLabel} <Search size={22} /></Button>
        {#if settingsStore.enablePythonMatchingService}
            <Button onclick={async () => getMatchings("pythonService")} variant="secondary">Matching Service <Search size={22} /></Button>
        {/if}
        <Input
            onkeydown={(e) => {
                if (e.key === "Enter") getMatchings("terminology");
            }}
            placeholder="search for a value..."
            bind:value={searchInput}
        />
    </div>

    <div class={{ "rounded-sm min-h-42 border border-border flex flex-col flex-1 ": true, "animate-puls": loading }}>
        {#if currentSearchResult}
            <div class="flex min-h-0 flex-1 flex-col overflow-y-auto p-3">
                <dl class="grid grid-cols-[7rem_minmax(0,1fr)] gap-x-3 gap-y-2 text-sm">
                    <dt class="font-medium text-muted-foreground">Label</dt>
                    <dd>{currentSearchResult.label}</dd>

                    <dt class="font-medium text-muted-foreground">CURIE</dt>
                    <dd>{iriToCurie(currentSearchResult.shortForm ?? "") || "Not available"}</dd>

                    <dt class="font-medium text-muted-foreground">Full IRI</dt>
                    <dd class="break-all">
                        <a href={currentSearchResult.iri} target="_blank">
                            {currentSearchResult.iri}
                        </a>
                    </dd>

                    <dt class="font-medium text-muted-foreground">Source</dt>
                    <dd>{terminologyProviderLabel}</dd>

                    {#if currentSearchResult.source === "pythonService" && currentSearchResult.score !== undefined}
                        <dt class="font-medium text-muted-foreground">Score</dt>
                        <dd>{currentSearchResult.score}</dd>
                    {/if}
                </dl>

                <div class="mt-4 border-t pt-3">
                    <h5 class="mb-2 text-sm font-medium">Descriptions</h5>
                    {#if currentSearchResult.description && currentSearchResult.description.length > 0}
                        <ul class="list-disc pl-5 pr-2">
                            {#each currentSearchResult.description as description}
                                <li class="py-1 break-all">{description?.value ?? description}</li>
                            {/each}
                        </ul>
                    {:else}
                        <p class="italic text-sm text-muted-foreground">No descriptions</p>
                    {/if}
                </div>
            </div>
            <div class="mt-auto flex items-center gap-2 border-t p-2">
                <Button class="w-32" variant="outline" size="icon" disabled={searchResultIdx === 0} onclick={() => switchSearchResult(-1)}
                    ><ArrowLeft /></Button
                >
                <p class="flex-1 text-center text-sm text-muted-foreground">Result {searchResultIdx + 1} of {ontologySearchResults.length}</p>
                <Button
                    class="w-32"
                    variant="outline"
                    size="icon"
                    disabled={searchResultIdx === ontologySearchResults.length - 1}
                    onclick={() => switchSearchResult(1)}><ArrowRight /></Button
                >
            </div>
        {:else}
            <div class="flex items-center justify-center h-full flex-1">
                {#if loading}<LoaderCircle class="animate-spin" />
                {:else if noResults}<p class="text-muted-foreground">No results for {searchInput}</p>
                {:else}<p class="text-muted-foreground">Search for ontologies or define the mapping manually</p>{/if}
            </div>
        {/if}
    </div>

    <div class="mt-auto flex flex-col w-full gap-2">
        <SSSOMInput
            bind:mapping={sssomMapping}
            shortForm={shortFormInput}
            iri={iriInput}
            bind:prefix={curieMapPrefix}
            bind:baseIri={curieMapBaseIri}
            bind:curieMapDetailsAccepted
        />
        <!-- <div class="flex gap-2 items-end w-full py-2">
            <div class="flex flex-col w-full gap-2">
                <Label for="iri-input">IRI</Label><Input
                    id="iri-input"
                    placeholder="e.g. http://purl.obolibrary.org/obo/OBI_1234"
                    bind:value={iriInput}
                />
            </div>
            <div class="flex flex-col gap-2 w-1/3">
                <Label for="short-form-input">Short Form</Label><Input
                    id="short-form-input"
                    placeholder="e.g. OBI:1234"
                    bind:value={shortFormInput}
                />
            </div>
        </div> -->
        <div class="flex gap-2">
            <Button class="w-1/3" disabled={!curieMapDetailsAccepted} onclick={addSssomMapping}>Map</Button>
            <Select.Root
                type="single"
                bind:value={selectValue}
                onValueChange={() => {
                    selectedMapping = mappingStore.findMapping(selectValue)!;
                    shortFormInput = selectedMapping.shortForm;
                    iriInput = selectedMapping.iri;
                }}
            >
                <Select.Trigger class="w-full col-span-2">{triggerContent}</Select.Trigger>
                <Select.Content>
                    <Select.Item value={"new-mapping"} label={"Create a new mapping"}></Select.Item>
                    <Select.Group
                        ><Select.Label>Terms</Select.Label>
                        {#each selectOptions as option}<Select.Item value={option.value} label={option.label}>{option.label}</Select.Item>{/each}
                    </Select.Group>
                </Select.Content>
            </Select.Root>
        </div>
    </div>
</div>
