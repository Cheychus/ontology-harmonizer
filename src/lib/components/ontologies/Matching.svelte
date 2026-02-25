<script lang="ts">
  import type { ITerminologySearchResult } from "$lib/types/terminologyService";

  interface Props {
    ontology: ITerminologySearchResult;
  }

  let { ontology }: Props = $props();
</script>

{#if ontology}
  <div class="flex flex-col rounded border border-secondary gap-2 p-2 h-40 max-h-40">
    <p class="font-bold">{ontology.label} - {ontology.short_form}</p>
    <div class="overflow-y-auto flex flex-col gap-4">
      <ul class="list-disc pl-8 pr-2">
        {#if ontology.descriptions.length > 0}
          {#each ontology.descriptions as description, index}
            <li class="py-1 text-wrap break-normal">{description}</li>
          {/each}
        {:else}
          <li class="italic">No descriptions</li>
        {/if}
      </ul>
    </div>
  </div>
{/if}
