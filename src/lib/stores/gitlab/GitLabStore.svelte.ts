import { GITLAB_INSTANCE_BASE, PATH_TO_ARC_JSON } from "$lib/config/settings";
import type { IGitLabProject } from "$lib/types/gitLab";

export class GitLabStore {
    public baseUrl: URL;
    public projectsBase: URL;

    constructor() {
        this.baseUrl = new URL(GITLAB_INSTANCE_BASE);
        this.projectsBase = new URL("projects", this.baseUrl);
    }
}

export const gitLabStore = new GitLabStore();

