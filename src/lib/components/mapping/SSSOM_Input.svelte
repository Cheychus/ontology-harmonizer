<script lang="ts">
    import type { SssomMapping } from "$lib/types/mapping";
    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import Label from "../ui/label/label.svelte";
    import * as Select from "$lib/components/ui/select/index.js";
    import { ArrowRight, MessageSquarePlus, UserPlus, X } from "lucide-svelte";

    interface Props {
        mapping: SssomMapping;
    }
    let { mapping = $bindable() }: Props = $props();
    const predicates = [
        { value: "skos:exactMatch", label: "Exact Match" },
        { value: "skos:closeMatch", label: "Close Match" },
        { value: "skos:relatedMatch", label: "Related Match" },
    ];
    const triggerContent = $derived(predicates.find((predicate) => predicate.value === mapping.predicateId)?.label ?? "Select a predicate");
    let showComment = $state(Boolean(mapping.comment));
    function addAuthorId() {
        mapping.authorIds = [...(mapping.authorIds ?? []), ""];
    }
    function removeAuthorId(index: number) {
        mapping.authorIds = (mapping.authorIds ?? []).filter((_, authorIndex) => authorIndex !== index);
    }
</script>

<div class="flex items-center gap-2">
    <h3 class="text-2xl">SSSOM Mapping</h3>
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
<div class="grid grid-cols-[minmax(8rem,0.9fr)_auto_auto_auto_auto_minmax(16rem,2fr)] items-end gap-3 py-2">
    <div class="flex min-w-0 flex-col gap-2">
        <Label for="subject-id">Subject ID</Label>
        <p class="flex min-h-9 items-center break-words" title={mapping.subjectId}>{mapping.subjectId}</p>
    </div>
    <ArrowRight class="mb-2" />
    <div class="flex flex-col gap-2">
        <Label for="predicate-id">Predicate ID</Label>
        <Select.Root type="single" name="predicateId" bind:value={mapping.predicateId}>
            <Select.Trigger class="w-[180px]">{triggerContent}</Select.Trigger>
            <Select.Content
                ><Select.Group
                    ><Select.Label>Predicates</Select.Label>{#each predicates as predicate (predicate.value)}<Select.Item
                            value={predicate.value}
                            label={predicate.label}>{predicate.label}</Select.Item
                        >{/each}</Select.Group
                ></Select.Content
            >
        </Select.Root>
    </div>
    <div class="flex flex-col gap-2">
        <Label for="mapping-confidence">Confidence</Label>
        <Input id="mapping-confidence" class="w-20 text-center" type="number" min="0" max="1" step="0.01" bind:value={mapping.confidence} />
    </div>
    <ArrowRight class="mb-2" />

    <div class="flex min-w-0 flex-col gap-2">
        <Label for="object-id">Object ID (Object Label)</Label>
        <p class="flex min-h-9 items-center break-words" title={`${mapping.objectId} (${mapping.objectLabel ?? ""})`}>
            {mapping.objectId} ({mapping.objectLabel ?? ""})
        </p>
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
