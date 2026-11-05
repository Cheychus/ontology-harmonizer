<script lang="ts">
  import { goto } from "$app/navigation";
  import { Button } from "../ui/button";
  import { Badge } from "$lib/components/ui/badge";
  import { ExternalLink, GitBranch } from "lucide-svelte";
  import * as Item from "$lib/components/ui/item/index.js";
  import { arcStore } from "$lib/stores/arcs/ArcStore.svelte";
  import type { IGitLabProject } from "$lib/types/gitLab";
  import { success } from "$lib/services/toasts/toastService";

  interface Props {
    project: IGitLabProject;
  }

  let { project }: Props = $props();
  let selecting = $state(false);
  let selected = $derived(arcStore.arcProjectId === Number(project.id));
  let avatarFailed = $state(false);
  let lastActivity = $derived(formatLastActivity(project.last_activity_at));

  function formatLastActivity(value?: string) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
  }

  async function selectArc() {
    if (selecting) return;
    selecting = true;
    try {
      const p = await arcStore.selectArc(Number(project.id));
      success("Selected " + p.name);
      await goto("/mapping");
    } finally {
      selecting = false;
    }
  }
</script>

<Item.Root variant="outline" size="sm" class={selected ? "border-primary bg-muted/30" : ""}>
  <div class="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted text-sm font-medium" aria-hidden="true">
    {#if project.avatar_url && !avatarFailed}
      <img class="size-full object-cover" src={project.avatar_url} alt="" loading="lazy" onerror={() => (avatarFailed = true)} />
    {:else}
      {project.name.slice(0, 1).toUpperCase()}
    {/if}
  </div>
  <Item.Content class="min-w-0">
    <Item.Title class="w-full flex-wrap font-semibold">
      <span class="break-words">{project.name}</span>
      {#if selected}<Badge variant="secondary">Selected</Badge>{/if}
      {#if project.archived}<Badge variant="outline">Archived</Badge>{/if}
    </Item.Title>
    {#if project.name_with_namespace && project.name_with_namespace !== project.name}
      <p class="break-words text-xs text-muted-foreground">{project.name_with_namespace}</p>
    {/if}
    {#if project.description}
      <Item.Description class="line-clamp-2" title={project.description}>{project.description}</Item.Description>
    {/if}
    <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
      {#if project.default_branch}
        <span class="inline-flex min-w-0 items-center gap-1" title="Default branch"><GitBranch class="size-3 shrink-0" /><span class="break-all">{project.default_branch}</span></span>
      {/if}
      {#if lastActivity}
        <span>Last activity: <time datetime={project.last_activity_at}>{lastActivity}</time></span>
      {/if}
    </div>
    {#if project.topics?.length}
      <div class="mt-1 flex flex-wrap gap-1">
        {#each project.topics.slice(0, 2) as topic}
          <Badge variant="secondary" class="max-w-full"><span class="truncate" title={topic}>{topic}</span></Badge>
        {/each}
        {#if project.topics.length > 2}
          <Badge variant="outline" title={project.topics.slice(2).join(", ")}>+{project.topics.length - 2}</Badge>
        {/if}
      </div>
    {/if}
  </Item.Content>
  <Item.Actions>
    {#if project.web_url}
      <Button href={project.web_url} target="_blank" rel="noopener noreferrer" variant="ghost" size="icon-sm" aria-label={`Open ${project.name} in DataHUB`} title="Open in DataHUB"><ExternalLink class="size-4" /></Button>
    {/if}
    <Button variant="outline" size="sm" disabled={arcStore.selecting || selected} onclick={selectArc}>{selecting ? "Loading ARC..." : selected ? "Selected" : "Select ARC"}</Button>
  </Item.Actions>
</Item.Root>
