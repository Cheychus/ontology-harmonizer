import { GITLAB_API_PATH } from "$lib/config/settings";
import type { GitAction } from "$lib/services/arcs/arctrl";
import type { IGitLabProject } from "$lib/types/gitLab";
import { apiGet, apiSend } from "./api";

export function updateProject(project: IGitLabProject, newBranch: string, gitActions: GitAction[]) {
  const payload = {
    branch: newBranch,
    commit_message: "Ontology Harmonizer: Updated ontologies [label->OBI:1234, label2->OBI:2345, organism->NCIT:1234]",
    id: project.id,
    start_branch: project.default_branch,
    actions: gitActions,
  };
  const res = apiSend(fetch, { method: "POST", path: `/api/gitlab/projects/${project.id}/repository/commits`, data: payload });
  return res;
}

export function createMergeRequest(project: IGitLabProject, sourceBranch: string) {
  const res = apiSend(fetch, {
    method: "POST",
    path: `/api/gitlab/projects/${project.id}/merge_requests`,
    data: {
      source_branch: sourceBranch,
      target_branch: project.default_branch,
      title: "Ontology Harmonizer: Automatically generated merge request",
      description: "Updated the following ontologies: ...",
      remove_source_branch: true,
      squash: true,
    },
  });
  return res;
}
