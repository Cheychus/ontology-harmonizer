<script lang="ts">
    import HelpHint from "$lib/components/HelpHint.svelte";
    import type { IGitLabUser } from "$lib/types/gitLab";
    import { apiGet } from "$lib/api/api";
    import { Button } from "$lib/components/ui/button";
    import ContributorEditor from "$lib/components/mapping/ContributorEditor.svelte";
    import { startDemo } from "$lib/services/demo/demo";
    import { applicationStore } from "$lib/stores/application/ApplicationStore.svelte";
    import { Leaf, Play } from "lucide-svelte";
    import { onMount } from "svelte";

    let user: IGitLabUser | null = $state(null);

    /**
     * Fill the first default Author with user data from GitLab if not already filled with data.
     * @param user
     */
    function loadContributorWithUserData(user: IGitLabUser) {
        const profileAuthor = applicationStore.defaultMappingContributors.find((contributor) => contributor.role === "author");
        if (!profileAuthor) return;

        if (!profileAuthor.id?.trim()) {
            const email = (user.email || user.commit_email || "").trim();
            profileAuthor.id = email ? `mailto:${email}` : "";
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
            <div class="flex items-center gap-2">
                <h3>Mapping contributors</h3>
                <HelpHint helpKey="mappingContributors" />
            </div>
            <p class="text-sm text-muted-foreground">Default contributors for newly created mappings</p>
        </div>

        <ContributorEditor bind:contributors={applicationStore.defaultMappingContributors} />
    </div>
</section>
