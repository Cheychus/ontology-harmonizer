<script lang="ts">
  import type { PageProps } from "./$types";
  import { enhance } from "$app/forms";
  import ArcSelect from "$lib/components/gitlab/ArcSelect.svelte";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { loadArcFile } from "$lib/services/arcs/arcFile.service";
  import { success } from "$lib/services/toasts/toastService";
  import { applicationStore } from "$lib/stores/application/ApplicationStore.svelte";
  import { arcStore } from "$lib/stores/arcs/ArcStore.svelte";
  import { Leaf, RefreshCwIcon, Upload } from "lucide-svelte";
  import { onMount } from "svelte";

  let { data }: PageProps = $props();
  let user = $derived(data.user);
  let projectSearch = $state("");
  let filteredProjects = $derived(arcStore.projects.filter((project) => project.name.toLowerCase().includes(projectSearch.trim().toLowerCase())));
  let publicProjects = $derived(filteredProjects.filter((project) => project.visibility === "public"));
  let privateProjects = $derived(filteredProjects.filter((project) => project.visibility === "private"));

  onMount(() => {
    applicationStore.gitLabUser = user;
    applicationStore.isAuthenticated = Boolean(user);
    if (user && arcStore.projects.length === 0) {
      arcStore.loadArcs();
    }
  });

  let fileInput: HTMLInputElement;
  /**
   * Import JSON Files
   * @param event
   */
  async function handleChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    const file = input.files[0];

    const json = await loadArcFile(file);
    arcStore.project = null;
    arcStore.arcProjectId = null;
    arcStore.filename = file.name;
    arcStore.init(json);
    success("Selected " + file.name);
  }

</script>

<input class="hidden" type="file" accept="application/json,.json" bind:this={fileInput} onchange={handleChange} />
<section class="flex w-full flex-1 flex-col gap-6">
  <h2>Select ARC</h2>

  <div class="grid gap-4 sm:grid-cols-2">
    <div class="flex flex-col gap-4 rounded-lg border bg-card p-4 shadow-sm">
      <div>
        <h3>Local ARC</h3>
        <p class="text-sm text-muted-foreground">Upload an ARC-RO-Crate JSON file. No login required.</p>
      </div>
      <Button class="mt-auto self-start" variant="outline" onclick={() => fileInput.click()}><Upload />Upload ARC</Button>
    </div>

    <div class="flex flex-col gap-4 rounded-lg border bg-card p-4 shadow-sm">
      <div>
        <div class="flex flex-wrap items-start justify-between gap-3">
          <h3>DataHUB</h3>
          {#if user}
            <div class="flex min-w-0 items-center gap-2">
              <img class="size-8 rounded-full" src={user.avatar_url} alt="" />
              <div class="min-w-0 text-sm">
                <p class="break-all font-medium text-primary">{user.username}</p>
                <p class="text-xs text-green-600">Connected</p>
              </div>
            </div>
          {/if}
        </div>
        <p class="text-sm text-muted-foreground">
          {user ? "Browse your projects below." : "Connect to DataHUB to browse your projects."}
        </p>
      </div>
      {#if user}
        <div class="mt-auto flex flex-wrap items-center gap-2">
          <Button variant="outline" disabled={arcStore.loading} onclick={() => arcStore.loadArcs()}>
            <RefreshCwIcon class={arcStore.loading ? "animate-spin" : ""} />
            {arcStore.loading ? "Loading projects..." : "Refresh projects"}
          </Button>
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
        </div>
      {:else}
        <Button class="mt-auto self-start" variant="outline" href="/auth/gitlab"><Leaf size={18} class="text-green-500" />Connect to DataHUB</Button>
      {/if}
    </div>
  </div>

  {#if arcStore.initialised}
    <div class="flex w-full flex-wrap items-center justify-between gap-3 rounded-lg border bg-card p-4 shadow-sm">
      <div>
        <p class="font-medium">Selected ARC: {arcStore.filename || "Demo ARC"}</p>
        <p class="text-sm text-muted-foreground">{arcStore.ontologyCandidates.size} ontology fields found.</p>
      </div>
      <Button href="/mapping">Configure mapping</Button>
    </div>
  {/if}

  {#if user}
    {#if arcStore.projects.length > 0}
      <div class="flex flex-wrap items-center gap-3">
        <Input class="w-full sm:max-w-md" aria-label="Search projects by name" placeholder="Search projects by name..." bind:value={projectSearch} />
        <p class="text-sm text-muted-foreground" role="status">{filteredProjects.length} of {arcStore.projects.length} projects</p>
      </div>
      {#if filteredProjects.length === 0}
        <p class="text-sm text-muted-foreground">No projects match your search.</p>
      {/if}
      {#if publicProjects.length > 0}
        <div class="flex flex-col gap-3">
          <h3>Public projects ({publicProjects.length})</h3>
          {#each publicProjects as project (project.id)}
            <ArcSelect {project} />
          {/each}
        </div>
      {/if}
      {#if privateProjects.length > 0}
        <div class="flex flex-col gap-3">
          <h3>Private projects ({privateProjects.length})</h3>
          {#each privateProjects as project (project.id)}
            <ArcSelect {project} />
          {/each}
        </div>
      {/if}
    {:else}
      <p class="text-sm text-muted-foreground" role="status">
        {arcStore.loading ? "Loading DataHUB projects..." : "No projects available. Try refreshing the project list."}
      </p>
    {/if}
  {/if}
</section>
