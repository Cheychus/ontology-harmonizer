<script>
    import ArcSelect from "$lib/components/gitlab/ArcSelect.svelte";
    import { Button } from "$lib/components/ui/button";
    import { gitlabInstances } from "$lib/config/gitlabInstances";
    import { arcStore } from "$lib/stores/arcs/ArcStore.svelte";
    import { Leaf, Sprout } from "lucide-svelte";
    import { onMount } from "svelte";

    let projects = $state([]);
    let privateProjects = $derived(projects.filter((p) => p.visibility === "private"));
    let publicProjects = $derived(projects.filter((p) => p.visibility === "public"));

    let loaded = $state(false);
    onMount(async () => {
        const res = await fetch("/api/projects?membership=true&per_page=50");
        if (res.ok) {
            projects = await res.json();
        } else {
            console.error("Error while loading projects");
        }
        loaded = true;
    });

    $inspect(projects);
</script>

<section class="w-full pt-32 flex flex-col justify-center gap-16 pb-32">
    <div class="flex gap-2">
        {#each gitlabInstances as instance}
            <Button variant="outline" size="lg" href="/auth/gitlab">Login to {instance.name} <Leaf size={20} class="text-green-500" /></Button>
        {/each}
    </div>

    <p>Downloaded Arc: {arcStore.filename}</p>

    {#if projects.length > 0}
        <div class="flex flex-col gap-4">
            <h1>Public Projects</h1>
            {#each publicProjects as project}
                <ArcSelect {project} />
            {/each}

            <h1>Private Projects</h1>
            {#each privateProjects as project}
                <ArcSelect {project} />
            {/each}
        </div>
    {:else if !loaded}
        <p>Loading Projects...</p>
    {:else}
        <p>No projects found</p>
    {/if}
</section>
