<script lang="ts">
  import type { Snippet } from "svelte";
  import { Button } from "$lib/components/ui/button";

  let {
    backHref,
    backLabel = "Back",
    status,
    actions,
    height = $bindable(72),
    reserveSpace = true,
  }: {
    backHref?: string;
    backLabel?: string;
    status: Snippet;
    actions: Snippet;
    height?: number;
    reserveSpace?: boolean;
  } = $props();
</script>

{#if reserveSpace}
  <div class="shrink-0" style:height={`${height + 16}px`} aria-hidden="true"></div>
{/if}

<footer bind:clientHeight={height} aria-label="Workflow actions" class="fixed inset-x-0 bottom-0 z-40 border-t bg-background px-4 py-3 shadow-sm">
  <div class="mx-auto grid w-full max-w-5xl grid-cols-[auto_minmax(0,1fr)] items-center gap-3 lg:grid-cols-[auto_minmax(0,1fr)_auto]">
    <div>
      {#if backHref}
        <Button href={backHref} variant="outline" aria-label={backLabel}>
          <span class="sm:hidden">Back</span><span class="hidden sm:inline">{backLabel}</span>
        </Button>
      {/if}
    </div>
    <div class="col-span-2 row-start-2 min-w-0 text-center lg:col-span-1 lg:col-start-2 lg:row-start-1" role="status">
      {@render status()}
    </div>
    <div class="col-start-2 row-start-1 flex min-w-0 flex-wrap items-center justify-end gap-2 lg:col-start-3 [&>*]:h-auto [&>*]:min-h-9 [&>*]:max-w-full [&>*]:whitespace-normal">
      {@render actions()}
    </div>
  </div>
</footer>
