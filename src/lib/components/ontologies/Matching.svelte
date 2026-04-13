<script lang="ts">
  import type { ITerminologySearchResult } from "$lib/types/terminologyService";
  import { onMount } from "svelte";
  import type { IMatchingViewModel } from "./Matchings.svelte";

  interface Props {
    ontology: IMatchingViewModel;
  }

  let { ontology }: Props = $props();

  let score: null | number = $derived(ontology.score ? Math.round(ontology.score * 100) : null);
</script>

{#if ontology}
  <div class="flex flex-col rounded border border-secondary gap-2 p-2 h-40 max-h-40">
    <div class="flex justify-between">
      <p class="font-bold">{ontology.label} - {ontology.shortForm}</p>
      {#if score}
        <p class:text-red-500={score < 50} class:text-orange-500={score >= 50 && score < 90} class:text-green-500={score >= 90}>{score}%</p>
      {/if}
    </div>

    <div class="overflow-y-auto flex flex-col gap-4">
      <ul class="list-disc pl-8 pr-2">
        {#if ontology.description && ontology.description.length > 0}
          {#each ontology.description as description, index}
            <li class="py-1 text-wrap break-normal">{description}</li>
          {/each}
        {:else}
          <li class="italic">No descriptions</li>
        {/if}
      </ul>
    </div>
  </div>
{/if}
