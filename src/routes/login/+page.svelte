<script lang="ts">
    import type { IGitLabUser } from "$lib/types/gitLab";
    import { apiGet } from "$lib/api/api";
    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import * as Select from "$lib/components/ui/select/index.js";
    import { startDemo } from "$lib/services/demo/demo";
    import { applicationStore } from "$lib/stores/application/ApplicationStore.svelte";
    import { Leaf, Play, UserPlus, X } from "lucide-svelte";
    import { onMount } from "svelte";
    import type { ContributorRole } from "$lib/types/mapping";

    let user: IGitLabUser | null = $state(null);

    const roles = [
        { value: "author", label: "Author" },
        { value: "reviewer", label: "Reviewer" },
    ];

    function addContributor() {
        applicationStore.defaultMappingContributors.push({ role: "author", id: "", label: "" });
    }

    function removeContributor(index: number) {
        applicationStore.defaultMappingContributors.splice(index, 1);
    }

    function roleLabel(role: ContributorRole) {
        return roles.find((item) => item.value === role)?.label ?? "Author";
    }

    /**
     * Fill the first default Author with user data from GitLab if not already filled with data.
     * @param user
     */
    function loadContributorWithUserData(user: IGitLabUser) {
        const profileAuthor = applicationStore.defaultMappingContributors.find((contributor) => contributor.role === "author");
        if (!profileAuthor) return;

        if (!profileAuthor.label?.trim() && !profileAuthor.id?.trim()) {
            profileAuthor.label = (user.name ?? "") || (user.username ?? "");
            profileAuthor.id = user.email || user.commit_email || "";
        }
    }

    onMount(async () => {
        applicationStore.isAuthenticated = false;
        try {
            user = await apiGet<IGitLabUser>(fetch, "/api/gitlab/user");
        } catch {
            user = null;
        }
        if (user) {
            applicationStore.gitLabUser = user;
            applicationStore.isAuthenticated = true;
        } else {
            return;
        }

        loadContributorWithUserData(user);
    });
</script>

<section class="flex w-full flex-1 flex-col items-start justify-start gap-6">
    <div class="flex w-full items-center gap-4 border-b pb-4">
        <h2>Login</h2>
        <div class="ml-auto flex items-center gap-2">
            {#if user}
                <div class="mr-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <img class="h-6 w-6 rounded-full" src={user.avatar_url} alt="" />
                    <span>{user.username}</span>
                </div>
            {:else}
                <Button variant="default" href="/auth/gitlab">DataHUB Login<Leaf size={18} class="text-green-500" /></Button>
            {/if}
            <Button href="/map" variant="outline" onclick={() => startDemo()}>Demo ARC <Play size={18} /></Button>
        </div>
    </div>

    <div class="flex w-full max-w-2xl flex-col gap-6 rounded-md border bg-card p-6 shadow-sm">
        <div class="flex flex-col gap-1">
            <h3>Mapping contributors</h3>
            <p class="text-sm text-muted-foreground">Default contributors for newly created mappings</p>
        </div>

        <div class="flex w-full max-w-3xl flex-col gap-2">
            <div class="flex justify-end">
                <Button variant="outline" size="sm" onclick={addContributor}>Add contributor <UserPlus /></Button>
            </div>
            {#if applicationStore.defaultMappingContributors.length > 0}
                <div class="grid grid-cols-[9rem_minmax(0,1fr)_minmax(0,1fr)_auto] gap-2 text-xs text-muted-foreground">
                    <span>Role</span>
                    <span>Identifier</span>
                    <span>Name</span>
                    <span class="sr-only">Actions</span>
                </div>
                {#each applicationStore.defaultMappingContributors as contributor, index}
                    <div class="grid grid-cols-[9rem_minmax(0,1fr)_minmax(0,1fr)_auto] items-center gap-2">
                        <Select.Root type="single" bind:value={contributor.role}>
                            <Select.Trigger class="w-full">{roleLabel(contributor.role)}</Select.Trigger>
                            <Select.Content>
                                <Select.Group>
                                    {#each roles as role (role.value)}
                                        <Select.Item value={role.value} label={role.label}>{role.label}</Select.Item>
                                    {/each}
                                </Select.Group>
                            </Select.Content>
                        </Select.Root>
                        <Input aria-label={`Contributor ${index + 1} identifier`} placeholder="ORCID or email" bind:value={contributor.id} />
                        <Input aria-label={`Contributor ${index + 1} name`} placeholder="Name" bind:value={contributor.label} />
                        <Button
                            variant="outline"
                            size="icon-sm"
                            aria-label={`Remove contributor ${index + 1}`}
                            onclick={() => removeContributor(index)}><X /></Button
                        >
                    </div>
                {/each}
            {/if}
        </div>
    </div>
</section>
