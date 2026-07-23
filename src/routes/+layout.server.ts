import { apiGet } from "$lib/api/api";
import { GITLAB_API_PATH } from "$lib/config/settings";
import type { IGitLabUser } from "$lib/types/gitLab";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ fetch }) => {
    try {
        const user = await apiGet<IGitLabUser>(fetch, `/api/gitlab/user`);
        return { user };
    } catch (e) {
        console.log("error", e)
        return { user: null };
    }
};