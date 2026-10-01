<script lang="ts">
    import type { DerivedOntology } from "$lib/stores/arcs/ArcStore.svelte";
    import { mappingStore, type IMapping } from "$lib/stores/mapping/MappingStore.svelte";
    import { Search, LoaderCircle, ArrowLeft, ArrowRight } from "lucide-svelte";
    import { Input } from "../ui/input";
    import { Button } from "../ui/button";
    import { Label } from "../ui/label";
    import * as Select from "$lib/components/ui/select/index.js";
    import type { IMatchingViewModel } from "../ontologies/Matchings.svelte";
    import { matchingStore, type IMatchingServiceData } from "$lib/stores/pythonService/MatchingStore.svelte";
    import { searchTerms, terminologyProviders, type TerminologyProviderId } from "$lib/api/terminology";
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
    const searchSource = $derived(settingsStore.matchingMethod === "pythonService" ? "pythonService" : settingsStore.terminologyProvider);
    const searchSourceLabel = $derived(settingsStore.matchingMethod === "pythonService" ? "Python Matching Service" : terminologyProviderLabel);

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

    function selectSearchSource(value: string) {
        if (value === "pythonService") {
            settingsStore.matchingMethod = "pythonService";
        } else {
            settingsStore.matchingMethod = "terminology";
            settingsStore.terminologyProvider = value as TerminologyProviderId;
        }

        if (settingsStore.automaticMatching) {
            getMatchings(settingsStore.matchingMethod);
        }
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
                addSssomMapping();
                break;
            case "Escape":
                mappingStore.skip();
                break;
        }
    }}
>
    <div class="flex items-start justify-between gap-4 rounded-md border border-border bg-muted/30 p-3">
        <div class="min-w-0">
            <p class="text-sm font-medium text-muted-foreground">Mapping source</p>
            <h3 class="mb-3 break-words text-lg font-semibold">{currentOntology.key}</h3>

            <dl class="grid grid-cols-[7rem_minmax(0,1fr)] gap-x-3 gap-y-2 text-sm">
                <dt class="font-medium text-muted-foreground">Attribute</dt>
                <dd>{currentOntology.ontologyAttribute}</dd>

                <dt class="font-medium text-muted-foreground">Value</dt>
                <dd class="break-all">
                    {#if currentOntology.value !== ""}
                        <a class="text-primary underline-offset-4 hover:underline" href={currentOntology.value} target="_blank" rel="noreferrer">
                            {currentOntology.value}
                        </a>
                    {:else}
                        <span class="italic text-muted-foreground">Not defined</span>
                    {/if}
                </dd>
            </dl>
        </div>

        <Button variant="secondary" class="shrink-0" onclick={() => mappingStore.skip()}>Skip</Button>
    </div>
    <div class="flex flex-col flex-wrap gap-2 pt-2">
        <div class="flex gap-1">
            <Switch
                onCheckedChange={() => {
                    if (settingsStore.automaticMatching) {
                        getMatchings(settingsStore.matchingMethod);
                    }
                    refocus();
                }}
                bind:checked={settingsStore.automaticMatching}
            />
            <Label class="whitespace-nowrap">Automatic Search</Label>
        </div>

        <div class="flex gap-1">
            <Select.Root type="single" name="searchSource" value={searchSource} onValueChange={selectSearchSource}>
                <Select.Trigger class="w-64">{searchSourceLabel}</Select.Trigger>
                <Select.Content>
                    <Select.Group>
                        <Select.Label>Terminology services</Select.Label>
                        {#each terminologyProviders as provider (provider.id)}
                            <Select.Item value={provider.id} label={provider.label}>{provider.label}</Select.Item>
                        {/each}
                    </Select.Group>
                    {#if settingsStore.enablePythonMatchingService}
                        <Select.Group>
                            <Select.Label>Matching services</Select.Label>
                            <Select.Item value="pythonService" label="Python Matching Service">Python Matching Service</Select.Item>
                        </Select.Group>
                    {/if}
                </Select.Content>
            </Select.Root>

            <Input
                class="min-w-64 flex-1"
                onkeydown={(e) => {
                    if (e.key === "Enter") getMatchings(settingsStore.matchingMethod);
                }}
                placeholder="search for a value..."
                bind:value={searchInput}
            />
            <Button onclick={() => getMatchings(settingsStore.matchingMethod)} variant="secondary">Search <Search size={22} /></Button>
        </div>
    </div>

    <div class={{ "rounded-sm min-h-42 border border-border flex flex-col flex-1 ": true, "animate-puls": loading }}>
        {#if currentSearchResult}
            <div class="flex min-h-0 flex-1 flex-col overflow-y-auto p-3">
                <p class="text-sm font-medium text-muted-foreground">Search result</p>
                <h3 class="mb-3 break-words text-lg font-semibold">{currentSearchResult.label}</h3>

                <dl class="grid grid-cols-[7rem_minmax(0,1fr)] gap-x-3 gap-y-2 text-sm">
                    <dt class="font-medium text-muted-foreground">CURIE</dt>
                    <dd>{iriToCurie(currentSearchResult.shortForm ?? "") || "Not available"}</dd>

                    <dt class="font-medium text-muted-foreground">Full IRI</dt>
                    <dd class="break-all">
                        <a href={currentSearchResult.iri} target="_blank">
                            {currentSearchResult.iri}
                        </a>
                    </dd>

                    <dt class="font-medium text-muted-foreground">Source</dt>
                    <dd>{searchSourceLabel}</dd>

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
                {:else}<p class="text-muted-foreground">Select a terminology service and search for ontology terms</p>{/if}
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
