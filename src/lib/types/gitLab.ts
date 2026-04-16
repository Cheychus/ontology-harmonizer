export type GitLabApiResponse<T> = T | GitLabError;

export type GitLabError = {
  message: string;
};

export interface IGitLabProject {
  id: string;
  name: string;
  name_with_namespace: string;
  description: string | null;
  default_branch: string;
  visibility: "public" | "private";
}

export interface IGitLabUser {
  id: number;
  username: string;
  avatar_url: string;
  web_url: string;
  commit_email: string;
}

export interface IGitlabResponse {
  title: string;
  web_url: string;
}
