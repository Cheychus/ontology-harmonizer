<script lang="ts">
    import Label from "../ui/label/label.svelte";
    import * as Select from "$lib/components/ui/select/index.js";
    import { ArrowRight } from "lucide-svelte";

    const { subjectId = "", subjectLabel = "", objectId = "", objectLabel = "" } = $props();

    const predicates = [
        { value: "skos:exactMatch", label: "Exact Match" },
        { value: "skos:closeMatch", label: "Close Match" },
        { value: "skos:relatedMatch", label: "Related Match" },
    ];

    let value = $state("skos:exactMatch");

    const triggerContent = $derived(predicates.find((p) => p.value === value)?.label ?? "Select a predicate");
</script>

<div class="flex gap-4 py-2">
    <div class="flex flex-col gap-2">
        <Label for="subject-id">Subject ID</Label>
        <div class="flex gap-2 items-center h-full">
            <p>{subjectId}</p>
            <ArrowRight />
        </div>
    </div>

    <div class="flex flex-col gap-2">
        <Label for="predicate-id">Predicate ID</Label>
        <div class="flex gap-2 items-center h-full">
            <Select.Root type="single" name="predicateId" bind:value>
                <Select.Trigger class="w-[180px]">
                    {triggerContent}
                </Select.Trigger>
                <Select.Content>
                    <Select.Group>
                        <Select.Label>Fruits</Select.Label>
                        {#each predicates as predicate (predicate.value)}
                            <Select.Item value={predicate.value} label={predicate.label}>
                                {predicate.label}
                            </Select.Item>
                        {/each}
                    </Select.Group>
                </Select.Content>
            </Select.Root>
            <ArrowRight />
        </div>
    </div>
    <div class="flex flex-col flex-1 gap-2">
        <Label for="object-id">Object ID (Object Label)</Label>
        <p class="h-full flex items-center">{objectId} ({objectLabel})</p>
    </div>
</div>
