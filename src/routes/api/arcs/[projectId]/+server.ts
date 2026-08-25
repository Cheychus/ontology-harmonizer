import { GITLAB_API_PATH, PATH_TO_ARC_JSON } from "$lib/config/settings";
import { json, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ params, cookies, fetch }) => {
    const projectId = params.projectId;

    if (!projectId || !/^[1-9]\d*$/.test(projectId)) {
        return json({ error: "Project ID must be a positive integer" }, { status: 400 });
    }

    const token = cookies.get("gitlab_token");
    const upstream = `${GITLAB_API_PATH}/projects/${projectId}/${PATH_TO_ARC_JSON}`;
    const response = await fetch(upstream, token ? {
        headers: { Authorization: `Bearer ${token}` },
    } : {});

    if (!response.ok) {
        return json({ error: "Unable to download ARC metadata", message: `${upstream}, ${response}` }, { status: response.status });
    }

    return new Response(response.body, {
        status: response.status,
        headers: {
            "Content-Type": response.headers.get("content-type") ?? "application/json",
        },
    });
};
