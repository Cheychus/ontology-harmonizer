<script lang="ts">
  import type { ITerminologySearchResult } from "$lib/types/terminologyService";
  import { ArrowLeft, ArrowRight } from "lucide-svelte";
  import Button from "../ui/button/button.svelte";
  import Matching from "./Matching.svelte";
  import * as Select from "$lib/components/ui/select/index.js";
  import { oboFileStore } from "$lib/stores/oboFiles/OboFileStore.svelte";
  import type { OboTerm } from "$lib/types/oboFiles";
  import Input from "../ui/input/input.svelte";
  import { iriToCurie } from "$lib/services/oboFiles/oboFile.service";
  import { Label } from "../ui/label";
  import { mappingStore, type IMapping } from "$lib/stores/mapping/MappingStore.svelte";

  interface Props {
    searchResults: ITerminologySearchResult[];
    arcOntologyName: string;
  }

  let { searchResults = $bindable(), arcOntologyName }: Props = $props();

  let idx = $derived(searchResults.length / searchResults.length - 1); // this will reset the idx when ontologies are updated
  let selectedOntology = $derived(searchResults[idx] ?? arcOntologyName);
  let selectValue = $derived("");
  let selectedMapping: IMapping | null = $state(null);
  let iriInput: string = $derived(searchResults[idx]?.iri ?? "");
  let shortFormInput: string = $derived(iriToCurie(searchResults[idx]?.short_form ?? ""));

  // Derive select options from the existing obo file mapping terms
  const selectOptions = $derived.by(() => {
    return (
      mappingStore.mappingJson.map((m) => {
        return { value: m.name, label: m.name };
      }) ?? []
    );
  });
  const triggerContent = $derived(selectOptions.find((o) => o.value === selectValue)?.label ?? "Create a new mapping");

  function mapOntology() {
    if (!selectedMapping && (!iriInput || !shortFormInput)) {
      console.error("No Mapping defined. Please select a existing mapping or specify iri and short form");
      return;
    }

    if (selectedMapping) {
      mappingStore.addSynonym(selectedMapping, arcOntologyName);
      selectedMapping.shortForm = shortFormInput;
    } else {
      const iri = iriInput;
      const label = selectedOntology.label ?? arcOntologyName;
      const xref = shortFormInput;
      mappingStore.addMapping(label, iri, arcOntologyName, xref);
    }

    mappingStore.compareMappingWithArc();
  }
</script>

<div class="flex flex-col gap-2">
  {#if searchResults.length > 0}
    <div class="flex justify-between gap-4 items-center">
      <Button class="w-32" variant="outline" size="icon" onclick={() => (idx = idx - 1 < 0 ? idx : idx - 1)}><ArrowLeft /></Button>
      <p class="font-bold">Match: {idx + 1} / {searchResults.length}</p>
      <Button class="w-32" variant="outline" size="icon" onclick={() => (idx = idx + 1 >= searchResults.length ? idx : idx + 1)}><ArrowRight /></Button>
    </div>

    <Matching ontology={searchResults[idx]} />
  {/if}
  <div class="grid grid-cols-2 w-full gap-2">
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
    <div class="flex col-span-2 items-end w-full py-2">
      <div class="flex flex-col w-full gap-2">
        <Label for="iri-input">IRI</Label>
        <Input id="iri-input" placeholder="e.g. http://purl.obolibrary.org/obo/OBI_1234" bind:value={iriInput} />
      </div>

      <div class="flex flex-col gap-2 w-1/3">
        <Label for="iri-input">Short Form</Label>
        <Input id="iri-input" placeholder="e.g. OBI:1234" bind:value={shortFormInput} />
      </div>
      <Button class="w-64" onclick={() => mapOntology()}>Map</Button>
    </div>
  </div>
</div>
