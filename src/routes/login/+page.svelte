<script lang="ts">
    import type { PageProps } from "./$types";
    import { enhance } from "$app/forms";
    import { Button } from "$lib/components/ui/button";
    import { applicationStore } from "$lib/stores/application/ApplicationStore.svelte";
    import { arcStore } from "$lib/stores/arcs/ArcStore.svelte";
    import { Leaf } from "lucide-svelte";
    import { onMount } from "svelte";

    let { data }: PageProps = $props();
    let user = $derived(data.user);

    onMount(() => {
        applicationStore.gitLabUser = user;
        applicationStore.isAuthenticated = Boolean(user);
    });
</script>

<section class="flex w-full flex-1 flex-col items-start justify-start gap-6">
    <div class="flex w-full items-center gap-4 border-b pb-4">
        <h2>Account</h2>
        <div class="ml-auto flex items-center gap-2">
            {#if user}
                <div class="mr-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <img class="h-6 w-6 rounded-full" src={user.avatar_url} alt="" />
                    <span>{user.username}</span>
                </div>
                <form
                    method="POST"
                    action="?/logout"
                    use:enhance={() => async ({ result, update }) => {
                        if (result.type === "success") {
                            applicationStore.isAuthenticated = false;
                            applicationStore.gitLabUser = null;
                            applicationStore.stepState.isLoggedIn = false;
                            arcStore.projects = [];
                        }
                        await update();
                    }}
                >
                    <Button type="submit" variant="outline">Log out</Button>
                </form>
            {:else}
                <Button variant="outline" href="/auth/gitlab"><Leaf size={18} class="text-green-500" />Connect to DataHUB</Button>
            {/if}
            <Button href="/select-arc">{user ? "Select ARC" : "Continue without login"}</Button>
        </div>
    </div>

</section>
