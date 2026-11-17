<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { arcStore } from "$lib/stores/arcs/ArcStore.svelte";

  let terms = $derived(Array.from(arcStore.ontologyCandidates.keys()));
</script>

<section class="flex w-full flex-1 flex-col gap-6">
  <div>
    <h2>Filter terms</h2>
    <p class="text-sm text-muted-foreground">Review the terms extracted from your ARC before configuring the mapping.</p>
  </div>

  {#if !arcStore.initialised}
    <div class="flex flex-col items-start gap-3 rounded-lg border bg-card p-4 shadow-sm">
      <p>Select an ARC to view its terms.</p>
      <Button href="/select-arc">Select ARC</Button>
    </div>
  {:else}
    <div class="rounded-lg border bg-card p-4 shadow-sm">
      <p class="break-all font-medium">{arcStore.filename || "Demo ARC"}</p>
      <fieldset class="mt-4 flex flex-col gap-3">
        <legend class="mb-2 text-sm font-medium">Term filter</legend>
        <label class="flex cursor-pointer items-start gap-3 rounded-md border p-3">
          <input class="mt-1" type="radio" name="term-filter" value="standard" checked={arcStore.termFilter === "standard"} onchange={() => arcStore.setTermFilter("standard")} />
          <span>
            <span class="block text-sm font-medium">Standard</span>
            <span class="block text-sm text-muted-foreground">Includes terms whose corresponding propertyID, unitCode or valueReference attribute is present, even if it is empty.</span>
          </span>
        </label>
        <label class="flex cursor-pointer items-start gap-3 rounded-md border p-3">
          <input class="mt-1" type="radio" name="term-filter" value="all" checked={arcStore.termFilter === "all"} onchange={() => arcStore.setTermFilter("all")} />
          <span>
            <span class="block text-sm font-medium">Include all</span>
            <span class="block text-sm text-muted-foreground">Includes every non-empty property name, unit and value, including numbers, even without a reference attribute.</span>
          </span>
        </label>
      </fieldset>
    </div>

    <div class="overflow-hidden rounded-lg border bg-card shadow-sm">
      <div class="border-b p-4">
        <h3>Extracted terms ({terms.length})</h3>
        <p class="text-sm text-muted-foreground">Each distinct term is shown once.</p>
      </div>
      {#if terms.length > 0}
        <ul class="max-h-96 overflow-y-auto divide-y" aria-label="Extracted terms">
          {#each terms as term (term)}
            <li class="break-words px-4 py-3 text-sm">{term}</li>
          {/each}
        </ul>
      {:else}
        <p class="p-4 text-sm text-muted-foreground">No terms found with the selected filter.</p>
      {/if}
    </div>

    <div class="flex flex-wrap items-center justify-between gap-3">
      <Button href="/select-arc" variant="outline">Back to ARC selection</Button>
      <Button href="/mapping">Continue</Button>
    </div>
  {/if}
</section>
