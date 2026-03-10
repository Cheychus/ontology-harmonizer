import { DATAHUB_ID, DATAHUB_SECRET, GITLAB_CLIENT_SECRET, REDIRECT_URI } from "$env/static/private";
import { gitlabInstances } from "$lib/config/gitlabInstances.js";
import { redirect } from "@sveltejs/kit";

export const GET = async ({ url, fetch, cookies }) => {
  const code = url.searchParams.get("code");

  const res = await fetch(`${gitlabInstances[0].baseUrl}/oauth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: DATAHUB_ID,
      client_secret: DATAHUB_SECRET,
      code: code,
      grant_type: "authorization_code",
      redirect_uri: REDIRECT_URI,
    }),
  });

  const data = await res.json();

  const accessToken = data.access_token;
  console.log(data);

  cookies.set("gitlab_token", accessToken, {
    path: "/",
    httpOnly: true,
    secure: false,
  });
  throw redirect(302, "/");
};
