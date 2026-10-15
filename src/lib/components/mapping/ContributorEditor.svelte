<script lang="ts">
    import type { ContributorRole, MappingContributor } from "$lib/types/mapping";
    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import * as Select from "$lib/components/ui/select/index.js";
    import { UserPlus, X } from "lucide-svelte";

    let { contributors = $bindable() }: { contributors: MappingContributor[] } = $props();

    const roles = [
        { value: "author", label: "Author" },
        { value: "reviewer", label: "Reviewer" },
    ];

    function addContributor() {
        contributors.push({ role: "author", id: "", label: "" });
    }

    function removeContributor(index: number) {
        contributors.splice(index, 1);
    }

    function roleLabel(role: ContributorRole) {
        return roles.find((item) => item.value === role)?.label ?? "Author";
    }
</script>

<div class="flex w-full flex-col gap-2">
    <div class="flex justify-end">
        <Button variant="outline" size="sm" onclick={addContributor}>Add contributor <UserPlus /></Button>
    </div>
    {#if contributors.length > 0}
        <div class="hidden grid-cols-[9rem_minmax(0,1fr)_minmax(0,1fr)_auto] gap-2 text-xs text-muted-foreground sm:grid" aria-hidden="true">
            <span>Role</span>
            <span>Identifier</span>
            <span>Name</span>
            <span class="sr-only">Actions</span>
        </div>
        {#each contributors as contributor, index}
            <div class="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-md border p-2 sm:grid-cols-[9rem_minmax(0,1fr)_minmax(0,1fr)_auto] sm:rounded-none sm:border-0 sm:p-0">
                <Select.Root type="single" bind:value={contributor.role}>
                    <Select.Trigger class="w-full" aria-label={`Contributor ${index + 1} role`}>{roleLabel(contributor.role)}</Select.Trigger>
                    <Select.Content>
                        <Select.Group>
                            {#each roles as role (role.value)}
                                <Select.Item value={role.value} label={role.label}>{role.label}</Select.Item>
                            {/each}
                        </Select.Group>
                    </Select.Content>
                </Select.Root>
                <Input class="col-start-1 row-start-2 sm:col-start-auto sm:row-start-auto" aria-label={`Contributor ${index + 1} identifier`} placeholder="ORCID or email" bind:value={contributor.id} />
                <Input class="col-start-1 row-start-3 sm:col-start-auto sm:row-start-auto" aria-label={`Contributor ${index + 1} name`} placeholder="Name" bind:value={contributor.label} />
                <Button class="col-start-2 row-start-1 sm:col-start-auto sm:row-start-auto" variant="outline" size="icon-sm" aria-label={`Remove contributor ${index + 1}`} onclick={() => removeContributor(index)}><X /></Button>
            </div>
        {/each}
    {:else}
        <p class="text-sm text-muted-foreground">No contributors added.</p>
    {/if}
</div>
