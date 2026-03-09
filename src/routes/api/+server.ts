import type { RequestHandler } from '@sveltejs/kit';
export const GET: RequestHandler = async ({ url, fetch, cookies }) => {
    const target = url.searchParams.get('target');

    if (!target) {
        return new Response(JSON.stringify({
            error: 'Missing target param',
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        }))
    }
    const token = cookies.get('gitlab_token');
    const res = await fetch(target, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    const data = await res.arrayBuffer();

    return new Response(data, {
        headers: {
            'Content-Type': res.headers.get('content-type') ?? 'application/octet-stream',
        }
    });
};