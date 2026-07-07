import { api, unwrap } from "./client";
import type { User } from "./types";

export async function login(email: string, password: string) {
  return unwrap<{ token: string; user: User }>(await api.post("/auth/login", { email, password }));
}

export async function getMe() {
  return unwrap<User>(await api.get("/auth/me"));
}
