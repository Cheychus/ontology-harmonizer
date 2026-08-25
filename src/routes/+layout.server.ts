import { apiGet } from "$lib/api/api";
import type { IGitLabUser } from "$lib/types/gitLab";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ fetch }) => {
    try {
        const user = await apiGet<IGitLabUser>(fetch, `/api/gitlab/user`);
        return { user };
    } catch (e) {
        return { user: null };
    }
};
