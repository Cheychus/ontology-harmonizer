<script lang="ts">
  import ArcSelect from "$lib/components/gitlab/ArcSelect.svelte";
  import GitLabUser from "$lib/components/gitlab/GitLabUser.svelte";
  import { Button } from "$lib/components/ui/button";
  import Input from "$lib/components/ui/input/input.svelte";
  import { getCurrentUser, getProject, getProjects } from "$lib/services/gitlab/gitlab";
  import { arcStore } from "$lib/stores/arcs/ArcStore.svelte";
  import { GitLabStore } from "$lib/stores/gitlab/GitLabStore.svelte";
  import type { IGitLabProject, IGitLabUser } from "$lib/types/gitLab";
  import { Leaf, RefreshCwIcon, Sprout } from "lucide-svelte";
  import { onMount } from "svelte";

  let projects: IGitLabProject[] = $state([]);
  let privateProjects = $derived(projects.filter((p) => p.visibility === "private"));
  let publicProjects = $derived(projects.filter((p) => p.visibility === "public"));

  let loaded = $state(false);
  let load = $state(false);
  let arcProjectId: number | null = $state(null);

  async function loadArcs() {
    load = true;
    projects = await getProjects();

    load = false;
  }
</script>

<section class="w-full pt-32 flex flex-col justify-center gap-16 pb-32">
  <h3>Selected ARC: {arcStore.filename}</h3>

  <div class="flex gap-2">
    <Button variant="outline" size="lg" href="/auth/gitlab">Login to GitLab Instance <Leaf size={20} class="text-green-500" /></Button>
  </div>

  <div class="flex flex-col gap-2">
    <div>
      <Button variant="default" onclick={() => loadArcs()}><RefreshCwIcon class={load ? "animate-spin" : ""} /> Load ARCs</Button>
    </div>
    <div class="flex gap-2">
      <Input class="max-w-64" bind:value={arcProjectId} type="number" placeholder="ARC Project ID" />
      <Button
        variant="outline"
        onclick={async () => {
          if (arcProjectId) {
            const project = await getProject(arcProjectId);
            console.log(project, " selected");
            // arcStore.init(arcJson);
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
