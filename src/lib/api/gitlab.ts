import { GITLAB_API_PATH } from "$lib/config/settings";
import type { GitAction } from "$lib/services/arcs/arctrl";
import { arcStore } from "$lib/stores/arcs/ArcStore.svelte";
import { mappingStore } from "$lib/stores/mapping/MappingStore.svelte";
import type { IGitLabProject } from "$lib/types/gitLab";
import { apiGet, apiSend } from "./api";

export function updateProject(project: IGitLabProject, newBranch: string, gitActions: GitAction[]) {
  let commitMsg: string[] = []
  mappingStore.mappedOntologies.forEach((o) => commitMsg.push(o.key))
  const payload = {
    branch: newBranch,
    commit_message: `Ontology Harmonizer: Updated ontologies [${commitMsg.join(", ")}]`,
    id: project.id,
    start_branch: project.default_branch,
    actions: gitActions,
  };
  const res = apiSend(fetch, { method: "POST", path: `/api/gitlab/projects/${project.id}/repository/commits`, data: payload });
  return res;
}

export function createMergeRequest(project: IGitLabProject, sourceBranch: string) {
  let commitMsg: string[] = []
  mappingStore.mappedOntologies.forEach((o) => commitMsg.push(o.key))
  const res = apiSend(fetch, {
    method: "POST",
    path: `/api/gitlab/projects/${project.id}/merge_requests`,
    data: {
      source_branch: sourceBranch,
      target_branch: project.default_branch,
      title: "Ontology Harmonizer: Automatically generated merge request",
      description: `Updated ontologies [${commitMsg.join(", ")}]`,
      remove_source_branch: true,
      squash: true,
    },
  });
  return res;
}
