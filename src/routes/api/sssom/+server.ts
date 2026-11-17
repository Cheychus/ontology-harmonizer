import { json } from "@sveltejs/kit";
import { parseSSSOMString } from "sssom-js";

export async function POST({ request }) {
    try {
        const body = await request.json();
        const result = await parseSSSOMString(body.content);

        return json(result);
    } catch (error) {
        console.error(error);

        return json(
            { error: "Could not parse SSSOM file" },
            { status: 400 }
        );
    }
}