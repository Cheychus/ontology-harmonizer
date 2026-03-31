import { GITLAB_API_PATH } from "$lib/config/settings";
import type { IGitLabProject } from "$lib/types/gitLab";
import { apiGet, apiSend } from "./api";

export function updateProject(project: IGitLabProject) {
  const payload = {
    branch: "test1",
    commit_message: "update arc",
    id: project.id,
    start_branch: project.default_branch,
    actions: [
      {
        action: "update",
        file_path: "test",
        content: "new content",
      },
    ],
  };
  const res = apiSend(fetch, { method: "POST", path: `/api/gitlab/projects/${project.id}/repository/commits`, data: payload });
  return res;
}

export function createMergeRequest(project: IGitLabProject) {
  const res = apiSend(fetch, {
    method: "POST",
    path: `/api/gitlab/projects/${project.id}/merge_requests`,
    data: {
      source_branch: "test1",
      target_branch: "main",
      title: "Update ARC automatisch",
      description: "Automatisch generierter Merge Request",
      remove_source_branch: true,
      squash: true,
    },
  });
}
