<script lang="ts">
  import type { PageProps } from "./$types";
  import { Button } from "$lib/components/ui/button";

  let { data }: PageProps = $props();
</script>

<section class="flex w-full max-w-lg flex-col gap-4 rounded-lg border bg-card p-6 shadow-sm">
  {#if data.user}
    <h2>Connected to DataHUB</h2>
    <p>Return to your original tab and select <strong>Check connection</strong> to continue working.</p>
    <p class="text-sm text-muted-foreground">You can close this tab. Your ARC and mapping remain in the original tab.</p>
  {:else}
    <h2>No active DataHUB session</h2>
    <p>Sign in again, then return to your original tab.</p>
    <Button class="self-start" href="/auth/gitlab?reconnect=true">Sign in to DataHUB</Button>
  {/if}
</section>
