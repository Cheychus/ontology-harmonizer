<script lang="ts">
  import type { TermGroup } from "$lib/services/arcs/termGroups";
  import { Input } from "$lib/components/ui/input";
  import { ChevronDown } from "lucide-svelte";
  import { arcStore } from "$lib/stores/arcs/ArcStore.svelte";

  let { group, searchQuery = "" }: { group: TermGroup; searchQuery?: string } = $props();
  let valuesOpen = $state(false);
  let valueSearch = $state("");
  let valueTerms = $derived(group.values.flatMap((option) => option.occurrences));
  let selectedValues = $derived(group.values.filter((option) => arcStore.isTermIncluded(option.occurrences[0])).length);
  let matchingValues = $derived(group.values.filter((option) => option.label.toLowerCase().includes(searchQuery)));
  let previewValues = $derived(searchQuery && matchingValues.length > 0 ? matchingValues : group.values);
  let preview = $derived(previewValues.slice(0, 3).map((option) => option.label).join(" · "));
  let visibleValues = $derived(group.values.filter((option) => option.label.toLowerCase().includes(valueSearch.trim().toLowerCase())));
  const valuesId = $props.id();
</script>

<tbody class="border-b last:border-b-0">
  <tr class="align-top hover:bg-muted/20">
    <td class="px-4 py-3">
    {#if group.property}
      <label class="flex cursor-pointer items-start gap-3">
        <input class="mt-1 shrink-0" type="checkbox" checked={arcStore.isTermIncluded(group.property.occurrences[0])}
          aria-label={`Include property name ${group.name}`}
          onchange={(event) => group.property && arcStore.setTermsIncluded(group.property.occurrences, event.currentTarget.checked)} />
        <span class="min-w-0">
          <span class="block break-words text-sm font-medium">{group.name}</span>
        </span>
      </label>
    {:else}
      <p class="break-words text-sm font-medium">{group.name || "Unnamed property"}</p>
      <p class="text-xs text-muted-foreground">Name unavailable in this base filter</p>
    {/if}
    </td>
    <td class="px-4 py-3">
      {#if group.units.length > 0}
        <div class="flex max-h-24 flex-col gap-2 overflow-y-auto">
          {#each group.units as unit (unit.label)}
            <label class="flex min-w-0 cursor-pointer items-start gap-2 text-sm">
              <input class="mt-1 shrink-0" type="checkbox" checked={arcStore.isTermIncluded(unit.occurrences[0])}
                aria-label={`Include unit ${unit.label} for ${group.name || "unnamed property"}`}
                onchange={(event) => arcStore.setTermsIncluded(unit.occurrences, event.currentTarget.checked)} />
              <span class="break-words">{unit.label}</span>
            </label>
          {/each}
        </div>
      {:else}
        <span class="text-sm text-muted-foreground" aria-label="No units available">—</span>
      {/if}
    </td>
    <td class="px-4 py-3">
    {#if group.values.length > 0}
      <div class="flex items-start gap-3">
          <input class="mt-1 shrink-0" type="checkbox" checked={selectedValues === group.values.length}
            aria-label={`Include all values for ${group.name || "unnamed property"}`}
            indeterminate={selectedValues > 0 && selectedValues < group.values.length}
            onchange={(event) => arcStore.setTermsIncluded(valueTerms, event.currentTarget.checked)} />
        <div class="min-w-0 flex-1">
          <button type="button" class="flex w-full items-center gap-2 text-left text-sm font-medium hover:text-primary"
            aria-expanded={valuesOpen} aria-controls={valuesId} onclick={() => (valuesOpen = !valuesOpen)}>
            <span>{group.values.length} {group.values.length === 1 ? "label" : "labels"}</span>
            <span class="ml-auto text-xs font-normal text-muted-foreground">{selectedValues} selected</span>
            <ChevronDown class={`size-4 shrink-0 transition-transform ${valuesOpen ? "rotate-180" : ""}`} />
          </button>
          <p class="mt-1 truncate text-xs text-muted-foreground">{preview}{previewValues.length > 3 ? " · …" : ""}</p>
        </div>
      </div>
    {:else}
      <span class="text-sm text-muted-foreground" aria-label="No values available">—</span>
    {/if}
    </td>
  </tr>

  {#if group.values.length > 0}
    <tr id={valuesId} hidden={!valuesOpen}>
      <td colspan="3" class="border-t bg-muted/20 px-4 py-3 sm:px-6">
        {#if valuesOpen}
          <div class="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p class="text-sm font-medium">Values for {group.name || "unnamed property"}</p>
              <p class="text-xs text-muted-foreground">{group.values.length} different labels in {group.valueOccurrences} occurrences under this property. Repeated labels are listed once.</p>
            </div>
            <Input type="search" class="w-full sm:max-w-xs" placeholder="Search these values…" aria-label={`Search values for ${group.name || "unnamed property"}`} bind:value={valueSearch} />
          </div>
          <ul class="max-h-64 divide-y overflow-y-auto" aria-label={`Values for ${group.name || "unnamed property"}`}>
              {#each visibleValues as value (value.label)}
                <li class="py-2">
                  <label class="flex cursor-pointer items-start gap-2 text-sm">
                    <input class="mt-1 shrink-0" type="checkbox" checked={arcStore.isTermIncluded(value.occurrences[0])}
                      onchange={(event) => arcStore.setTermsIncluded(value.occurrences, event.currentTarget.checked)} />
                    <span class="min-w-0 flex-1 break-words">{value.label}</span>
                    <span class="shrink-0 text-xs text-muted-foreground">{value.occurrences.length} {value.occurrences.length === 1 ? "occurrence" : "occurrences"}</span>
                  </label>
                </li>
              {:else}
                <li class="py-3 text-sm text-muted-foreground">No values match your search.</li>
              {/each}
          </ul>
          {#if valueSearch.trim()}
            <p class="mt-2 text-xs text-muted-foreground">{visibleValues.length} of {group.values.length} values shown. The group checkbox applies to all values.</p>
          {/if}
        {/if}
      </td>
    </tr>
  {/if}
</tbody>
