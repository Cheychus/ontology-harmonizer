<script lang="ts">
  import ArcSelect from "$lib/components/gitlab/ArcSelect.svelte";
  import { Button } from "$lib/components/ui/button";
  import Input from "$lib/components/ui/input/input.svelte";
  import { gitlabInstances } from "$lib/config/gitlabInstances";
  import { arcStore } from "$lib/stores/arcs/ArcStore.svelte";
  import { gitLabStore } from "$lib/stores/gitlab/GitLabStore.svelte";
  import { Leaf, RefreshCwIcon, Sprout } from "lucide-svelte";
  import { onMount } from "svelte";

  let projects = $state([]);
  let privateProjects = $derived(projects.filter((p) => p.visibility === "private"));
  let publicProjects = $derived(projects.filter((p) => p.visibility === "public"));

  let loaded = $state(false);
  let load = $state(false);
  let arcProjectId: number | null = $state(null);
  onMount(async () => {});

  async function loadArcs() {
    load = true;
    const res = await fetch("/api/projects?membership=true&per_page=50");
    if (res.ok) {
      projects = await res.json();
    } else {
      console.error("Error while loading projects");
    }
    load = false;
  }

  $inspect(projects);
</script>

<section class="w-full pt-32 flex flex-col justify-center gap-16 pb-32">
  <h3>Selected ARC: {arcStore.filename}</h3>

  <div class="flex gap-2">
    {#each gitlabInstances as instance}
      <Button variant="outline" size="lg" href="/auth/gitlab">Login to {instance.name} <Leaf size={20} class="text-green-500" /></Button>
    {/each}
  </div>

  <div class="flex flex-col gap-2">
    <div>
      <Button variant="default" onclick={() => loadArcs()}><RefreshCwIcon class={load ? "animate-spin" : ""} /> Load ARCs from GitLab</Button>
    </div>
    <div class="flex gap-2">
      <Input class="max-w-64" bind:value={arcProjectId} type="number" placeholder="ARC Project ID" />
      <Button
        variant="outline"
        onclick={async () => {
          if (arcProjectId) {
            const arcJson = await gitLabStore.getProject(arcProjectId);
            arcStore.init(arcJson);
          }
        }}>Select</Button
      >
    </div>
  </div>

  {#if load}
    <p>Loading ARCs...</p>
  {/if}

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
  {/if}
</section>
