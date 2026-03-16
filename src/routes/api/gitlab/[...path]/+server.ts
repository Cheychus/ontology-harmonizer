import { GITLAB_API_PATH } from "$lib/config/settings.js";
import { json } from "@sveltejs/kit";

export const GET = async ({ params, url, cookies, fetch }) => {
    const token = cookies.get("gitlab_token");
    const path = `${GITLAB_API_PATH}/${params.path}/${url.search}`;

    const res = await fetch(path, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        return res;
    }

    const data = await res.json();
    return json(data);
};
