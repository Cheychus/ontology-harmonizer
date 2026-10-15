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
        contributors.push({ role: "author", id: "" });
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
        <div class="grid grid-cols-[max-content_minmax(0,1fr)_auto] items-center gap-2">
            <div class="col-span-3 grid grid-cols-subgrid text-xs text-muted-foreground" aria-hidden="true">
                <span>Role</span>
                <span>Identifier</span>
                <span class="sr-only">Actions</span>
            </div>
            {#each contributors as contributor, index}
                <div class="col-span-3 grid grid-cols-subgrid items-center">
                    <Select.Root type="single" bind:value={contributor.role}>
                        <Select.Trigger class="w-full" aria-label={`Contributor ${index + 1} role`}>
                            <span class="grid">
                                <span class="invisible col-start-1 row-start-1" aria-hidden="true">Reviewer</span>
                                <span class="col-start-1 row-start-1 text-left">{roleLabel(contributor.role)}</span>
                            </span>
                        </Select.Trigger>
                        <Select.Content>
                            <Select.Group>
                                {#each roles as role (role.value)}
                                    <Select.Item value={role.value} label={role.label}>{role.label}</Select.Item>
                                {/each}
                            </Select.Group>
                        </Select.Content>
                    </Select.Root>
                    <Input
                        class="min-w-0"
                        aria-label={`Contributor ${index + 1} identifier`}
                        placeholder="ORCID, URI or Email"
                        bind:value={contributor.id}
                    />
                    <Button variant="outline" size="icon-sm" aria-label={`Remove contributor ${index + 1}`} onclick={() => removeContributor(index)}
                        ><X /></Button
                    >
                </div>
            {/each}
        </div>
    {:else}
        <p class="text-sm text-muted-foreground">No contributors added.</p>
    {/if}
</div>
