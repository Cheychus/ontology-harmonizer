<script lang="ts">
    import { CircleQuestionMark } from "lucide-svelte";
    import { helpTexts } from "$lib/config/helpTexts";
    import * as Popover from "$lib/components/ui/popover";

    let { helpKey }: { helpKey: keyof typeof helpTexts } = $props();
</script>

<Popover.Root>
    <Popover.Trigger
        type="button"
        aria-label="Show help"
        class="inline-flex items-center rounded-sm text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2"
    >
        <CircleQuestionMark class="size-4" aria-hidden="true" />
    </Popover.Trigger>
    <Popover.Content side="bottom" class="max-w-[calc(100vw-2rem)] p-3 leading-relaxed">
        {helpTexts[helpKey]}
    </Popover.Content>
</Popover.Root>
