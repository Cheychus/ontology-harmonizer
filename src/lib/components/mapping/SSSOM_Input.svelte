<script lang="ts">
    import HelpHint from "$lib/components/HelpHint.svelte";
    import type { MappingContributor, SssomMapping } from "$lib/types/mapping";
    import { Button } from "$lib/components/ui/button";
    import ContributorEditor from "./ContributorEditor.svelte";
    import Label from "../ui/label/label.svelte";
    import { MessageSquarePlus } from "lucide-svelte";
    import { applicationStore } from "$lib/stores/application/ApplicationStore.svelte";

    interface Props {
        mapping: SssomMapping;
        contributors: MappingContributor[];
    }

    let { mapping = $bindable(), contributors = $bindable() }: Props = $props();

    let showComment = $state(Boolean(mapping.comment));
</script>

<div class="flex items-center gap-4 py-1">
    <h3 class="text-2xl">Additional Mapping Information</h3>
    <div class="ml-auto flex items-center gap-1">
        <Button
            variant="outline"
            size="icon-sm"
            aria-label="Add comment"
            title="Add comment"
            disabled={showComment}
            onclick={() => (showComment = true)}
        >
            <MessageSquarePlus />
        </Button>
    </div>
</div>

<div class="flex flex-col gap-4 py-2">
    {#if showComment}
        <div class="flex max-w-2xl flex-col gap-2">
            <div class="flex items-center gap-2">
                <Label for="mapping-comment">Comment</Label>
                <HelpHint helpKey="comment" />
                <Button
                    variant="ghost"
                    size="sm"
                    onclick={() => {
                        mapping.comment = "";
                        showComment = false;
                    }}>Remove comment</Button
                >
            </div>
            <textarea
                id="mapping-comment"
                class="border-input bg-background ring-offset-background focus-visible:border-ring focus-visible:ring-ring/50 min-h-20 w-full rounded-md border px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
                placeholder="Add a note about this mapping..."
                bind:value={mapping.comment}
            ></textarea>
        </div>
    {/if}

    <div class="flex max-w-3xl flex-col gap-2">
        <div class="flex items-center gap-2">
            <p class="text-sm font-medium">Mapping contributors</p>
            <HelpHint helpKey="mappingContributors" />
        </div>
        <ContributorEditor bind:contributors />
    </div>
</div>
