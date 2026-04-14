<script lang="ts">
    import type { IGitLabUser } from "$lib/types/gitLab";
    import { Leaf } from "lucide-svelte";
    import Button from "../ui/button/button.svelte";
    import { onMount } from "svelte";
    import { apiGet } from "$lib/api/api";
    import { applicationStore } from "$lib/stores/application/ApplicationStore.svelte";
    import { goto } from "$app/navigation";

    let user: IGitLabUser | null = $state(null);

    onMount(async () => {
        try {
            user = await apiGet<IGitLabUser>(fetch, `/api/gitlab/user`);
            console.log(user);
        } catch (e) {
            user = null;
        }
        if (user) {
            applicationStore.stepState.isLoggedIn = true;
        }
    });
</script>

{#if !user}
    <div class="flex flex-col gap-2">
        <Button variant="outline" size="lg" href="/auth/gitlab">Login to GitLab Instance <Leaf size={20} class="text-green-500" /></Button>

        <p class="text-center">Please authenticate first</p>
    </div>
{/if}

{#if user}
    <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-2 shadow p-4 rounded-md w-lg">
            <p class="">Authenticated as</p>
            <div class="flex gap-4 items-center">
                <img class="w-8 h-8 rounded-full" src={user?.avatar_url} alt="User Avatar" />
                <a href={user?.web_url}>{user?.username}</a>
                <p>-</p>
                <p>{user?.commit_email}</p>
            </div>
        </div>
        <div class="flex justify-end">
            <Button class="px-16" href="/select-arc">Continue</Button>
        </div>
    </div>
{/if}
