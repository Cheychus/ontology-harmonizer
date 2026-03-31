import { createMergeRequest, updateProject } from "$lib/api/gitlab";
import { arcStore } from "$lib/stores/arcs/ArcStore.svelte";
import { ARC } from "@nfdi4plants/arctrl";

export async function pushToGitlab() {
  const arcRoJson = JSON.stringify(arcStore.json);
  let arc: ARC = ARC.fromROCrateJsonString(arcRoJson);

  console.log(arc);
  const project = arcStore.project;
  if (!project) throw new Error("No Gitlab project defined");

  const projectId = project.id;
  const branch = project.default_branch;

  const response = await updateProject(project);
  console.log(response);
  await createMergeRequest(project);
}
