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
  web_url?: string;
  avatar_url?: string | null;
  last_activity_at?: string;
  archived?: boolean;
  topics?: string[];
}

export interface IGitLabUser {
  id?: number;
  username?: string;
  avatar_url?: string;
  web_url?: string;
  commit_email?: string;
  email?: string;
  name?: string;
}

export interface IGitlabResponse {
  title: string;
  web_url: string;
}
