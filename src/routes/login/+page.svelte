<script lang="ts">
    import type { IGitLabUser } from "$lib/types/gitLab";
    import { apiGet } from "$lib/api/api";
    import { Button } from "$lib/components/ui/button";
    import Input from "$lib/components/ui/input/input.svelte";
    import Label from "$lib/components/ui/label/label.svelte";
    import * as Select from "$lib/components/ui/select/index.js";
    import { startDemo } from "$lib/services/demo/demo";
    import { applicationStore } from "$lib/stores/application/ApplicationStore.svelte";
    import { Leaf, Play } from "lucide-svelte";
    import { onMount } from "svelte";

    let user: IGitLabUser | null = $state(null);

    const roles = [
        { value: "none", label: "No role" },
        { value: "author", label: "Author" },
        { value: "reviewer", label: "Reviewer" },
    ];
    const selectedRole = $derived(roles.find((item) => item.value === applicationStore.mappingProfile.role)?.label ?? "No role");

    onMount(async () => {
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
        if (!applicationStore.mappingProfile.name.trim()) {
            applicationStore.mappingProfile.name = (user.name ?? "") || (user.username ?? "");
        }

        if (!applicationStore.mappingProfile.email.trim()) {
            applicationStore.mappingProfile.email = user.email || user.commit_email || "";
        }
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
            <h3>Profile Information</h3>
            <p class="text-sm text-muted-foreground">Optional information for the mapping process</p>
        </div>

        <div class="flex max-w-md flex-col gap-2">
            <Label for="mapping-role">Role</Label>
            <Select.Root type="single" name="mapping-role" bind:value={applicationStore.mappingProfile.role}>
                <Select.Trigger id="mapping-role" class="w-full">{selectedRole}</Select.Trigger>
                <Select.Content>
                    <Select.Group>
                        {#each roles as item (item.value)}
                            <Select.Item value={item.value} label={item.label}>{item.label}</Select.Item>
                        {/each}
                    </Select.Group>
                </Select.Content>
            </Select.Root>
        </div>

        <div class="grid max-w-2xl gap-4 sm:grid-cols-2">
            <div class="flex flex-col gap-2">
                <Label for="profile-name">Name</Label>
                <Input id="profile-name" autocomplete="name" placeholder="Your name" bind:value={applicationStore.mappingProfile.name} />
            </div>
            <div class="flex flex-col gap-2">
                <Label for="profile-orcid">ORCID</Label>
                <Input id="profile-orcid" placeholder="0000-0000-0000-0000" bind:value={applicationStore.mappingProfile.orcid} />
            </div>
            <div class="flex flex-col gap-2 sm:col-span-2">
                <Label for="profile-email">Email</Label>
                <Input id="profile-email" type="email" autocomplete="email" bind:value={applicationStore.mappingProfile.email} />
            </div>
        </div>
    </div>
</section>
