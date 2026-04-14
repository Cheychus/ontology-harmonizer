<script lang="ts">
  import { Button } from "../ui/button";
  import * as Item from "$lib/components/ui/item/index.js";
  import { goto } from "$app/navigation";
  import { arcStore } from "$lib/stores/arcs/ArcStore.svelte";
  import type { IGitLabProject } from "$lib/types/gitLab";
  import { getArcJson, getProject } from "$lib/services/gitlab/gitlab";
  import { Projector } from "lucide-svelte";
  import { applicationStore } from "$lib/stores/application/ApplicationStore.svelte";

  interface Props {
    project: IGitLabProject;
  }

  let { project }: Props = $props();

  async function selectArc() {
    const arc = await getArcJson(Number(project.id));
    const p = await getProject(Number(project.id));
    console.log(p);
    arcStore.init(arc);
    arcStore.project = p;
    arcStore.filename = project.name;

    applicationStore.stepState.arcSelected = true;
    goto("/mapping");
  }
</script>

<Item.Root variant="outline">
  <Item.Content>
    <Item.Title>{project.name} - {project.id}</Item.Title>
    <Item.Description>{project.description}</Item.Description>
  </Item.Content>
  <Item.Actions>
    <Button variant="outline" size="sm" onclick={async () => selectArc()}>Select</Button>
  </Item.Actions>
</Item.Root>
