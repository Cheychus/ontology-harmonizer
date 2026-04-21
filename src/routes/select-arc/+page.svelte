<script lang="ts">
  import { goto } from "$app/navigation";
  import { apiGet } from "$lib/api/api";
  import ArcSelect from "$lib/components/gitlab/ArcSelect.svelte";
  import GitLabUser from "$lib/components/gitlab/GitLabUser.svelte";
  import { Button } from "$lib/components/ui/button";
  import Input from "$lib/components/ui/input/input.svelte";
  import { extractGroundTruth } from "$lib/helpers/groundTruth";
  import { loadArcFile } from "$lib/services/arcs/arcFile.service";
  import { getArcJson, getCurrentUser, getProject, getProjects } from "$lib/services/gitlab/gitlab";
  import { success, warning } from "$lib/services/toasts/toastService";
  import { applicationStore } from "$lib/stores/application/ApplicationStore.svelte";
  import { arcStore } from "$lib/stores/arcs/ArcStore.svelte";
  import type { IGitLabProject, IGitLabUser } from "$lib/types/gitLab";
  import { toast } from "@zerodevx/svelte-toast";
  import { Leaf, RefreshCwIcon, Sprout, Upload } from "lucide-svelte";
  import { onMount } from "svelte";

  // let projects: IGitLabProject[] = $state([]);
  // let privateProjects = $derived(projects.filter((p) => p.visibility === "private"));
  // let publicProjects = $derived(projects.filter((p) => p.visibility === "public"));

  // let load = $state(false);
  // let arcProjectId: number | null = $state(null);
  let user: IGitLabUser | null = $state(null);
  onMount(async () => {
    if (applicationStore.isAuthenticated && arcStore.projects.length <= 0) {
      arcStore.loadArcs();
    }

    try {
      user = await apiGet<IGitLabUser>(fetch, `/api/gitlab/user`);
    } catch (e) {
      user = null;
    }
    if (user) {
      applicationStore.isAuthenticated = true;
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
    arcStore.filename = file.name;
    arcStore.init(json);
    goto("/mapping");
    success("Selected " + file.name);
  }

  async function selectARC() {
    if (arcStore.arcProjectId) {
      const project = await getProject(arcStore.arcProjectId);
      console.log(project, " selected");
      const arcJson = await getArcJson(arcStore.arcProjectId);
      if (!arcJson) throw new Error("No Arc JSON");
      arcStore.init(arcJson);

      applicationStore.stepState.arcSelected = true;

      goto("/mapping");
      success("Selected " + project.name);
    }
  }
</script>

<input class="hidden" type="file" accept="application/json,.json" bind:this={fileInput} onchange={handleChange} />
<section class="flex-1 w-full flex flex-col justify-start items-start gap-2">
  <div class="w-full flex gap-4 pb-4">
    <h2>ARC Selection</h2>
    <Button variant="outline" onclick={() => arcStore.loadArcs()}><RefreshCwIcon class={arcStore.loading ? "animate-spin" : ""} /> Load ARCs</Button>
    <div class="ml-auto flex gap-1">
      <Input class="max-w-64" bind:value={arcStore.arcProjectId} type="number" placeholder="ARC Project ID" />
      <Button variant="outline" onclick={() => selectARC()}>Select</Button>
      <Button variant="secondary" onclick={() => fileInput.click()}>ARC-RO-Crate JSON<Upload size={22} /></Button>
    </div>
  </div>

  {#if arcStore.projects.length > 0}
    <div class="w-full flex flex-col gap-4">
      <h3>Public Projects</h3>
      {#each arcStore.publicProjects as project}
        <ArcSelect {project} />
      {/each}

      <h3>Private Projects</h3>
      {#each arcStore.privateProjects as project}
        <ArcSelect {project} />
      {/each}
    </div>
  {/if}

  {#if !applicationStore.isAuthenticated}
    <div class="w-full h-full flex-1 flex flex-col gap-4 items-center justify-center">
      <Button class="px-16" href="/login">Login</Button>
      <p>To select personal ARCs from GitLab you need to authenticate first.</p>
    </div>
  {/if}
</section>
