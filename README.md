# Ontology Harmonizer

> A SvelteKit prototype for adding consistent ontology references to ARC research-data metadata.
> 

Ontology Harmonizer is a prototype developed as part of my computer science bachelor's thesis. It supports research-data specialists in connecting recurring metadata fields in **[ARC](https://arc-rdm.org/) (Annotated Research Context)** containers with standardised ontology terms.

The project was created for a FAIRagro-related research-data workflow. Its goal is to make metadata more consistent, searchable and interoperable, for example when different source databases use field names such as `Organism`, `Species` or `CountryOfOrigin`.

## The problem

Research-data containers often inherit different field names from their source systems. Mapping those labels to shared ontology terms by hand is repetitive, difficult to reuse and easy to apply inconsistently.

Ontology Harmonizer turns those decisions into a reusable mapping. A domain expert can inspect metadata fields, look up suitable ontology terms, save the selected relations and apply the mapping to an ARC metadata file.

## What the prototype does

- imports an ARC-RO-Crate JSON file or retrieves an ARC from a configured NFDI4Plants GitLab instance ([DataHUB](https://www.nfdi4plants.org/arc-data-hub/))
- extracts ontology-related metadata candidates from the ARC graph
- lets users create, load and edit an mapping file
- searches the [TS4NFDI - API Gateway](https://ts4nfdi.github.io/api-gateway/) for ontology terms
- supports selecting a search result, creating a mapping term and adding references/synonyms
- applies the mapping to the loaded ARC metadata and exports the updated JSON file

## Implementation

I developed the prototype independently from the initial idea through to implementation, with feedback from domain experts.

The project combines a SvelteKit frontend with GitLab OAuth, ARC-RO-Crate JSON processing and an external terminology-service integration. I focused on making a specialised research-data workflow understandable and usable as a step-by-step web application.


## Tech stack

- **Frontend:** [Svelte 5, SvelteKit](https://svelte.dev/), [TypeScript](https://www.typescriptlang.org/)
- **UI:** [Tailwind CSS](https://tailwindcss.com/), [shadcn-svelte](https://www.shadcn-svelte.com/), [Lucide icons](https://lucide.dev/)
- **Data formats:** ARC-RO-Crate JSON
- **Integrations:** GitLab OAuth, GitLab API, [TS4NFDI - API Gateway](https://ts4nfdi.github.io/api-gateway/)
- **Deployment:** Vercel

## Research context

As part of my bachelor's thesis, I compared lexical and embedding-based approaches for ontology-term retrieval.

The embedding-based matching service developed for this work is available in a separate repository: [Python Matching Service](https://github.com/Cheychus/python-matching).

It can run as a [FastAPI](https://fastapi.tiangolo.com/) service and provide semantic ontology-term search for the web prototype. Before it can be used, the relevant ontologies need to be downloaded, parsed and converted into embedding vectors.

The web prototype also works without this service. In that case, ontology terms can still be searched through the API-based terminology service.

## Run locally

### Prerequisites

- Node.js 20 or later
- a GitLab OAuth application for the configured GitLab instance

### Configuration

Create a local `.env` file:

```
GITLAB_CLIENT_ID=<your-oauth-client-id>
GITLAB_CLIENT_SECRET=<your-oauth-client-secret>
REDIRECT_URI=http://localhost:5173/auth/gitlab/callback
```

The redirect URI must also be registered in the GitLab OAuth application.

### Installation

```bash
git clone https://github.com/Cheychus/ontology-harmonizer.git
cd ontology-harmonizer
npm ci
npm run dev
```

Open `http://localhost:5173`.


## Current status and limitations

This is a research prototype, not a production-ready data platform.

- The current extraction strategy relies on existing ontology-related fields. It needs further work for raw source data that has not yet been annotated.
- Mapping is currently applied to one ARC container at a time. Batch application to multiple containers is a planned next step.
- The mapping format is JSON-based. A move to the [SSSOM](https://mapping-commons.github.io/sssom/dev/) standard is under consideration for better interoperability.
- The main workflow needs a broader field test with real target data and domain users.

## What I learned

This project sharpened my skills in building reactive web applications, integrating OAuth-protected services and translating a specialised workflow into a focused interface. It also taught me to validate model and data choices earlier, automate repeatable evaluation steps and keep the first version of an architecture simpler.
