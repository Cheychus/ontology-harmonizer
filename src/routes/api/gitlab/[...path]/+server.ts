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

export const POST = async ({ params, url, cookies, request, fetch }) => {
  const token = cookies.get("gitlab_token");

  const path = `${GITLAB_API_PATH}/${params.path}`;

  const body = await request.json();

  const res = await fetch(path, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    return res;
  }

  const data = await res.json();
  return json(data);
};
