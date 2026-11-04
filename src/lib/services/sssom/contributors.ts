import type { MappingContributor, SssomContributorFields } from "$lib/types/mapping";


export function contributorsToSssomFields(contributors: MappingContributor[]): SssomContributorFields {

    const fields: SssomContributorFields = {
        authorIds: [],
        reviewerIds: [],
    }

    contributors = filterEmptyContributors(contributors);
    contributors.forEach((c) => {
        if (c.role === "author") {
            fields.authorIds.push(c.id ?? "");
        } else if (c.role === "reviewer") {
            fields.reviewerIds.push(c.id ?? "");

        }
    })

    return fields;
}

function filterEmptyContributors(contributors: MappingContributor[]) {
    return contributors
        .map((c) => {
            const id = c.id.trim();
            const isEmail = id.includes("@") && !id.includes(":");
            return { ...c, id: isEmail ? `mailto:${id}` : id };
        })
        .filter((c) => c.id !== "");
}
