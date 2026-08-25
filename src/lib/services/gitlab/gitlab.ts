import { apiGet } from "$lib/api/api";
import type { IGitLabProject, IGitLabUser } from "$lib/types/gitLab";

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
        return await apiGet<ARC_RO_JSON>(fetch, `/api/arcs/${id}`)
    } catch (e) {
        return null;
    }
}

export async function getCurrentUser() {
    try {
        const user = await apiGet<IGitLabUser>(fetch, `/api/gitlab/user`);
        return user;
    } catch (e) {
        return null;
    }
}
