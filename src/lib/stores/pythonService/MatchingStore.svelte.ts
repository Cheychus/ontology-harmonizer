import { apiGet, apiSend } from "$lib/api/api";

export interface IMatchingServiceData {
  id: string;
  label: string;
  rank: number;
  score: number;
  short_id: string;
  definition: string[];
  ontologies: string[];
  embedding_input: string;
}

interface IMatchingServiceResponse {
  data: {
    query: string;
    results: IMatchingServiceData[]
  }
  q: string;
}

const BASE_URL = "http://127.0.0.1:8000/";

class MatchingStore {
  async query(q: string) {
    const data = await apiGet(fetch, `/api?target=${BASE_URL}?q=${q}`) as IMatchingServiceResponse;

    console.log(data);
    return data.data.results as IMatchingServiceData[];
  }
}

export const matchingStore = new MatchingStore();
