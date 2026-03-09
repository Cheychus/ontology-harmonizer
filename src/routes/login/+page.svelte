<script>
    import { Button } from "$lib/components/ui/button";
    import { gitlabInstances } from "$lib/config/gitlabInstances";
    import { onMount } from "svelte";

    let projects = $state([]);
    let privateProjects = $derived(projects.filter((p) => p.visibility === "private"));
    let publicProjects = $derived(projects.filter((p) => p.visibility === "public"));
    onMount(async () => {
        const res = await fetch("/api/projects?membership=true&per_page=50");
        if (res.ok) {
            projects = await res.json();
        } else {
            console.error("Error while loading projects");
        }
    });

    $inspect(projects);
</script>

<section class="w-full pt-32 flex flex-col justify-center gap-16 pb-32">
    <div class="flex gap-2">
        {#each gitlabInstances as instance}
            <Button variant="outline" size="lg" href="/auth/gitlab">Login to {instance.name}</Button>
        {/each}
    </div>

    <div class="flex flex-col gap-4">
        <h1>Public Projects</h1>
        {#each publicProjects as project}
            <div class="shadow flex flex-col gap-2 p-4">
                <p>{project.id}</p>

                <div class="flex justify-between items-center">
                    <p>{project.name}</p>
                    <Button>Select</Button>
                </div>
            </div>
        {/each}

        <h1>Private Projects</h1>
        {#each privateProjects as project}
            <div class="shadow flex flex-col gap-2 p-4">
                <p>{project.id}</p>
                <div class="flex justify-between items-center">
                    <p>{project.name}</p>
                    <Button>Select</Button>
                </div>
            </div>
        {/each}
    </div>
</section>
