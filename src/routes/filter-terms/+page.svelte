<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import WorkflowFooter from "$lib/components/application/WorkflowFooter.svelte";
  import { Input } from "$lib/components/ui/input";
  import TermGroupRow from "$lib/components/arcs/TermGroupRow.svelte";
  import CustomValueFilter from "$lib/components/arcs/CustomValueFilter.svelte";
  import { groupArcTerms } from "$lib/services/arcs/termGroups";
  import { isNumericValue, isWebUrlValue } from "$lib/services/arcs/valuePredicates";
  import { arcStore } from "$lib/stores/arcs/ArcStore.svelte";

  let groups = $derived(groupArcTerms(arcStore.extractedOntologyValues));
  let search = $state("");
  let searchQuery = $derived(search.trim().toLowerCase());
  let hasSelectedNumbers = $derived(
    arcStore.allOntologyValues.some((term) => term.ontologyAttribute === "valueReference" && isNumericValue(term.key)),
  );
  let hasSelectedUrls = $derived(arcStore.allOntologyValues.some((term) => term.ontologyAttribute === "valueReference" && isWebUrlValue(term.key)));
  let visibleGroups = $derived(
    groups.filter(
      (group) =>
        group.name.toLowerCase().includes(searchQuery) ||
        group.units.some((option) => option.label.toLowerCase().includes(searchQuery)) ||
        group.values.some((option) => option.label.toLowerCase().includes(searchQuery)),
    ),
  );
</script>

<section class="flex w-full flex-1 flex-col gap-5 px-4 md:px-0">
  <div>
    <h2>Filter terms</h2>
    <p class="text-sm text-muted-foreground">Choose names, units and values independently. Open a value group to select individual terms.</p>
  </div>

  {#if !arcStore.initialised}
    <div class="flex flex-col items-start gap-3 rounded-lg border bg-card p-4 shadow-sm">
      <p>Select an ARC to view its terms.</p>
      <Button href="/select-arc">Select ARC</Button>
    </div>
  {:else}
    <div class="flex flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="min-w-0">
        <p class="truncate text-sm font-medium" title={arcStore.filename || "Demo ARC"}>{arcStore.filename || "Demo ARC"}</p>
        <p id="base-filter-description" class="mt-1 text-xs text-muted-foreground">
          {arcStore.termFilter === "standard"
            ? "Only terms with an existing reference field, even if empty. Use this to review or update annotations."
            : "All names, units and values, including numbers."}
        </p>
      </div>
      <label class="flex shrink-0 items-center gap-2 text-sm">
        <span class="text-muted-foreground">Base filter</span>
        <select
          class="h-9 rounded-md border bg-background px-3 text-sm"
          value={arcStore.termFilter}
          aria-describedby="base-filter-description"
          onchange={(event) => arcStore.setTermFilter(event.currentTarget.value === "all" ? "all" : "standard")}
        >
          <option value="all">Include all</option>
          <option value="standard">Existing reference fields</option>
        </select>
      </label>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <Button size="sm" variant="outline" disabled={!hasSelectedNumbers} onclick={() => arcStore.deselectValuesMatching(isNumericValue)}
        >Deselect numbers</Button
      >
      <Button
        size="sm"
        variant="outline"
        disabled={!hasSelectedUrls}
        onclick={() => arcStore.deselectValuesMatching(isWebUrlValue)}
        title="Deselect HTTP and HTTPS URLs, including DOI links">Deselect URLs</Button
      >
      <p class="text-xs text-muted-foreground">Values only, across all properties. You can reselect individual values.</p>
    </div>

    <CustomValueFilter />

    <div class="flex flex-wrap items-center justify-between gap-3">
      <Input
        type="search"
        class="w-full sm:max-w-md"
        placeholder="Search properties, units or values…"
        aria-label="Search properties, units or values"
        bind:value={search}
      />
      <p class="text-xs text-muted-foreground" role="status">{visibleGroups.length} of {groups.length} properties</p>
    </div>

    {#if visibleGroups.length > 0}
      <div class="overflow-x-auto rounded-lg border bg-card">
        <table class="w-full min-w-[38rem] table-fixed text-left">
          <caption class="sr-only">Select property names, units and values for mapping</caption>
          <colgroup><col class="w-[34%]" /><col class="w-[24%]" /><col class="w-[42%]" /></colgroup>
          <thead class="border-b bg-muted/40 text-xs text-muted-foreground">
            <tr>
              <th scope="col" class="px-4 py-3 font-medium">Property name</th>
              <th scope="col" class="px-4 py-3 font-medium">Units</th>
              <th scope="col" class="px-4 py-3 font-medium">Values</th>
            </tr>
          </thead>
          {#each visibleGroups as group (group.name)}
            <TermGroupRow {group} {searchQuery} />
          {/each}
        </table>
      </div>
    {:else if groups.length > 0}
      <div class="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4">
        <p class="text-sm text-muted-foreground">No properties, units or values match your search.</p>
        <Button variant="ghost" onclick={() => (search = "")}>Clear search</Button>
      </div>
    {:else}
      <p class="rounded-lg border p-4 text-sm text-muted-foreground">
        No terms found with the selected base filter. Try Include all to view terms without reference attributes.
      </p>
    {/if}

    <WorkflowFooter backHref="/select-arc" backLabel="Back to ARC selection">
      {#snippet status()}
        <p class="text-sm"><span class="font-semibold">{arcStore.ontologyCandidates.size}</span> labels selected for mapping</p>
      {/snippet}
      {#snippet actions()}
        <Button href="/mapping">Continue</Button>
      {/snippet}
    </WorkflowFooter>
  {/if}
</section>
