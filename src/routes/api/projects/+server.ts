import { json } from "@sveltejs/kit";

export const GET = async ({ url, cookies, fetch }) => {
    const token = cookies.get('gitlab_token');
    const res = await fetch(
        'https://git.nfdi4plants.org/api/v4/projects?' + url.searchParams.toString(),
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
    const data = await res.json();
    return json(data);
};