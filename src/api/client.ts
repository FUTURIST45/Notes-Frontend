import type { AuthResponse, Note } from "../types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

type RequestOptions = {
  method?: string;
  body?: unknown;
  token?: string | null;
};

async function request<T>(path: string, options: RequestOptions = {}) {
  const headers = new Headers();

  if (options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message ?? "Request failed.");
  }

  return data as T;
}

export function registerUser(email: string, password: string) {
  return request<AuthResponse>("/auth/register", {
    method: "POST",
    body: { email, password }
  });
}

export function loginUser(email: string, password: string) {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    body: { email, password }
  });
}

export function getNotes(token: string) {
  return request<{ notes: Note[] }>("/notes", { token });
}

export function createNote(token: string, title: string, content: string) {
  return request<{ note: Note }>("/notes", {
    method: "POST",
    token,
    body: { title, content }
  });
}

export function updateNote(token: string, id: string, title: string, content: string) {
  return request<{ note: Note }>(`/notes/${id}`, {
    method: "PUT",
    token,
    body: { title, content }
  });
}

export function deleteNote(token: string, id: string) {
  return request<void>(`/notes/${id}`, {
    method: "DELETE",
    token
  });
}

