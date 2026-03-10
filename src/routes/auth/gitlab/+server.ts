import { redirect } from "@sveltejs/kit";
import { DATAHUB_ID, REDIRECT_URI } from "$env/static/private";
import { gitlabInstances } from "$lib/config/gitlabInstances";

export const GET = async () => {
  const params = new URLSearchParams({
    client_id: DATAHUB_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: "api",
  });

  throw redirect(302, `${gitlabInstances[0].baseUrl}/oauth/authorize?${params.toString()}`);
};
