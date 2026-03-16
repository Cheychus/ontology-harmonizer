import { redirect } from "@sveltejs/kit";
import { APPLICATION_ID, REDIRECT_URI } from "$env/static/private";
import { GITLAB_INSTANCE_BASE } from "$lib/config/settings";

export const GET = async () => {
  const params = new URLSearchParams({
    client_id: APPLICATION_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: "api",
  });

  throw redirect(302, `${GITLAB_INSTANCE_BASE + "/oauth/authorize?" + params.toString()}`);
};
