<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { groupArcTerms } from "$lib/services/arcs/termGroups";
  import { valueContainsText } from "$lib/services/arcs/valuePredicates";
  import { arcStore } from "$lib/stores/arcs/ArcStore.svelte";

  let containsText = $state("");
  let matchCase = $state(false);
  let actionMessage = $state("");
  let previewOpen = $state(false);
  const inputId = $props.id();
  let matchingValues = $derived(arcStore.allOntologyValues.filter((term) =>
    term.ontologyAttribute === "valueReference" && matchesValue(term.key)));
  let matchingGroups = $derived(groupArcTerms(matchingValues));
  let matchingLabels = $derived(Array.from(new Set(matchingValues.map((term) => term.key))));

  function matchesValue(value: string) {
    return valueContainsText(value, containsText, matchCase);
  }

  function deselectMatches() {
    const count = matchingValues.length;
    if (count === 0) return;
    arcStore.deselectValuesMatching(matchesValue);
    actionMessage = `${count} value ${count === 1 ? "occurrence" : "occurrences"} deselected.`;
  }
</script>

<div class="rounded-lg border bg-card p-3">
  <div class="flex flex-wrap items-center gap-2">
    <label for={inputId} class="text-sm font-medium">Contains</label>
    <Input id={inputId} class="min-w-0 flex-1 basis-40" placeholder="e.g. HOR" bind:value={containsText}
      oninput={() => (actionMessage = "")} aria-describedby={`${inputId}-hint`} />
    <label class="flex min-h-9 cursor-pointer items-center gap-2 rounded-md px-2 py-1 whitespace-nowrap text-sm hover:bg-muted/50">
      <input class="size-5 shrink-0" type="checkbox" bind:checked={matchCase} onchange={() => (actionMessage = "")} />
      Match case
    </label>
    <Button size="sm" variant="outline" disabled={matchingValues.length === 0} onclick={deselectMatches}>Deselect matches</Button>
  </div>
  <p id={`${inputId}-hint`} class="mt-2 text-xs text-muted-foreground">{matchCase ? "Matches text with the same capitalization: HOR matches HOR 29, but not Hordeum vulgare." : "Matches text within values, ignoring case."} Applies to selected values across all properties. Names and units are not affected.</p>

  {#if actionMessage}<p class="mt-2 text-xs" role="status">{actionMessage}</p>{/if}

  {#if containsText.trim()}
    {#if matchingValues.length > 0}
      <div class="mt-3 border-t pt-2">
        <p class="text-xs text-muted-foreground" role="status">{matchingLabels.length} matching {matchingLabels.length === 1 ? "label" : "labels"} in {matchingGroups.length} {matchingGroups.length === 1 ? "property" : "properties"} ({matchingValues.length} {matchingValues.length === 1 ? "occurrence" : "occurrences"})</p>
        <p class="mt-1 truncate text-sm">{matchingLabels.slice(0, 3).join(" · ")}{matchingLabels.length > 3 ? " · …" : ""}</p>
        <details class="mt-2" bind:open={previewOpen}>
          <summary class="cursor-pointer text-xs font-medium">Preview all matches</summary>
          {#if previewOpen}
          <div class="mt-2 max-h-48 space-y-3 overflow-y-auto rounded-md bg-muted/20 p-3">
            {#each matchingGroups as group (group.name)}
              <div>
                <p class="break-words text-xs font-medium text-muted-foreground">{group.name || "Unnamed property"}</p>
                <ul class="mt-1 space-y-1">
                  {#each group.values as option (option.label)}
                    <li class="flex items-start justify-between gap-3 text-sm">
                      <span class="min-w-0 break-words">{option.label}</span>
                      <span class="shrink-0 text-xs text-muted-foreground">{option.occurrences.length} {option.occurrences.length === 1 ? "occurrence" : "occurrences"}</span>
                    </li>
                  {/each}
                </ul>
              </div>
            {/each}
          </div>
          {/if}
        </details>
      </div>
    {:else}
      <p class="mt-2 text-xs text-muted-foreground" role="status">No selected values match this text.</p>
    {/if}
  {/if}
</div>
