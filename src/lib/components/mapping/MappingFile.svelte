<script lang="ts">
    import Button from "$lib/components/ui/button/button.svelte";
    import { FileBraces } from "lucide-svelte";

    interface Props {
        name: string;
        size: number;
        description?: string;
        onSelect: () => void;
    }

    const { name, size, description, onSelect }: Props = $props();
</script>

<div class="flex min-h-32 flex-col gap-4 rounded-lg border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
    <div class="flex min-w-0 items-start gap-3">
        <FileBraces class="mt-0.5 size-5 shrink-0 text-muted-foreground" />
        <p class="min-w-0 truncate font-medium" title={name}>{name}</p>
    </div>
    <div class="flex flex-col gap-2">
        <p>Mappings: {size}</p>
        {#if description}
            <p class="text-muted-foreground">{description}</p>
        {/if}
    </div>

    <Button variant="outline" size="sm" class="mt-auto w-full" onclick={onSelect}>Select</Button>
</div>
