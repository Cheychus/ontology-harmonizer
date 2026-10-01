<script lang="ts">
    import type { SssomMapping } from "$lib/types/mapping";
    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import Label from "../ui/label/label.svelte";
    import { MessageSquarePlus, UserPlus, X } from "lucide-svelte";

    interface Props {
        mapping: SssomMapping;
    }

    let { mapping = $bindable() }: Props = $props();

    let showComment = $state(Boolean(mapping.comment));
    function addAuthorId() {
        mapping.authorIds = [...(mapping.authorIds ?? []), ""];
    }
    function removeAuthorId(index: number) {
        mapping.authorIds = (mapping.authorIds ?? []).filter((_, authorIndex) => authorIndex !== index);
    }
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
        <Button variant="outline" size="icon-sm" aria-label="Add author" title="Add author" onclick={addAuthorId}>
            <UserPlus />
        </Button>
    </div>
</div>

<div class="flex flex-col gap-4 py-2">
    {#if showComment}
        <div class="flex max-w-2xl flex-col gap-2">
            <div class="flex items-center gap-2">
                <Label for="mapping-comment">Comment</Label>
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

    {#if mapping.authorIds?.length}
        <div class="flex max-w-xl flex-col gap-2">
            <Label>Author IDs</Label>
            {#each mapping.authorIds as authorId, index}
                <div class="flex gap-2">
                    <Input
                        aria-label={`Author ID ${index + 1}`}
                        placeholder="e.g. name@example.org or orcid:0000-0000-0000-0000"
                        bind:value={mapping.authorIds[index]}
                    />
                    <Button variant="outline" size="icon-sm" aria-label={`Remove author ${index + 1}`} onclick={() => removeAuthorId(index)}
                        ><X /></Button
                    >
                </div>
            {/each}
        </div>
    {/if}
</div>
