<script lang="ts">
    import type { IGitLabUser } from "$lib/types/gitLab";
    import { Leaf } from "lucide-svelte";
    import Button from "../ui/button/button.svelte";

    interface Props {
        user: IGitLabUser | null;
    }

    let { user }: Props = $props();

    $inspect(user);
</script>

<div class="flex flex-col gap-2 shadow p-4">
    {#if user}
        Authenticated
        <div class="flex gap-4 items-center">
            <img class="w-8 h-8 rounded-full" src={user?.avatar_url} alt="User Avatar" />
            <a href={user?.web_url}>{user?.username}</a>
            <p>-</p>
            <p>{user?.commit_email}</p>
        </div>
    {:else}
        <Button variant="outline" size="lg" href="/auth/gitlab">Login to GitLab Instance <Leaf size={20} class="text-green-500" /></Button>
    {/if}
</div>
