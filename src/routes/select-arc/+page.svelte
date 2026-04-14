<script lang="ts">
  import { goto } from "$app/navigation";
  import ArcSelect from "$lib/components/gitlab/ArcSelect.svelte";
  import GitLabUser from "$lib/components/gitlab/GitLabUser.svelte";
  import { Button } from "$lib/components/ui/button";
  import Input from "$lib/components/ui/input/input.svelte";
  import { extractGroundTruth } from "$lib/helpers/groundTruth";
  import { loadArcFile } from "$lib/services/arcs/arcFile.service";
  import { getArcJson, getCurrentUser, getProject, getProjects } from "$lib/services/gitlab/gitlab";
  import { applicationStore } from "$lib/stores/application/ApplicationStore.svelte";
  import { arcStore } from "$lib/stores/arcs/ArcStore.svelte";
  import type { IGitLabProject, IGitLabUser } from "$lib/types/gitLab";
  import { Leaf, RefreshCwIcon, Sprout, Upload } from "lucide-svelte";
  import { onMount } from "svelte";

  let projects: IGitLabProject[] = $state([]);
  let privateProjects = $derived(projects.filter((p) => p.visibility === "private"));
  let publicProjects = $derived(projects.filter((p) => p.visibility === "public"));

  let loaded = $state(false);
  let load = $state(false);
  let arcProjectId: number | null = $state(null);

  async function loadArcs() {
    load = true;
    try {
      projects = await getProjects();
    } catch (e) {
      console.log("Error: ", e);
    } finally {
      load = false;
    }
  }

  let fileInput: HTMLInputElement;
  /**
   * Import JSON Files
   * @param event
   */
  async function handleChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    const file = input.files[0];

    await loadArcFile(file);
    arcStore.filename = file.name;
  }

  async function selectARC() {
    if (arcProjectId) {
      const project = await getProject(arcProjectId);
      console.log(project, " selected");
      const arcJson = await getArcJson(arcProjectId);
      if (!arcJson) throw new Error("No Arc JSON");
      arcStore.init(arcJson);

      applicationStore.stepState.arcSelected = true;
      goto("/mapping");
    }
  }

  $inspect(applicationStore.stepState);
</script>

<input class="hidden" type="file" accept="application/json,.json" bind:this={fileInput} onchange={handleChange} />
<section class=" w-full flex flex-col justify-center gap-2">
  <div class="w-full flex gap-4 pb-4">
    <h2>ARC Selection</h2>
    <Button variant="outline" onclick={() => loadArcs()}><RefreshCwIcon class={load ? "animate-spin" : ""} /> Load ARCs</Button>
    <div class="ml-auto flex gap-1">
      <Input class="max-w-64" bind:value={arcProjectId} type="number" placeholder="ARC Project ID" />
      <Button variant="outline" onclick={() => selectARC()}>Select</Button>
      <Button variant="secondary" onclick={() => fileInput.click()}>ARC-RO-Crate JSON<Upload size={22} /></Button>
    </div>
  </div>

  <!-- <div class="w-1/2 flex gap-2">
    <Input placeholder="search..." />
  </div> -->

  <div class="flex flex-col gap-2">
    <div></div>
    <div class="flex gap-2"></div>
  </div>

  {#if load}
    <p>Loading ARCs...</p>
  {/if}

  {#if projects.length > 0}
    <div class="flex flex-col gap-4">
      <h3>Public Projects</h3>
      {#each publicProjects as project}
        <ArcSelect {project} />
      {/each}

      <h3>Private Projects</h3>
      {#each privateProjects as project}
        <ArcSelect {project} />
      {/each}
    </div>
  {/if}
</section>
