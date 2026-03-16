import { apiGet } from "$lib/api/api";
import { PATH_TO_ARC_JSON, SERVER_URL } from "$lib/config/settings";
import type { GitLabApiResponse, GitLabError, IGitLabProject, IGitLabUser } from "$lib/types/gitLab";

export async function getProjects() {
    const projects = await apiGet<IGitLabProject[]>(fetch, "/api/gitlab/projects?membership=true&per_page=50");
    return projects;
}

export async function getProject(id: number) {
    const project = await apiGet<IGitLabProject>(fetch, "/api/gitlab/projects/" + id);
    return project;
}

/**
 * Download the arc-ro-crate metadata json file for a specific project.
 * @param id
 * @returns ARC-RO-JSON
 */
export async function getArcJson(id: number) {
    try {
        return await apiGet<ARC_RO_JSON>(fetch, `/api/gitlab/projects/${id}/${PATH_TO_ARC_JSON}`)
    } catch (e) {
        return null;
    }
}

export async function getCurrentUser() {
    console.log("hey i run")
    try {
        const user = await apiGet<IGitLabUser>(fetch, `/api/gitlab/user`);
        console.log(user)
        return user;
    } catch (e) {
        console.log("error", e)
        return null;
    }
}