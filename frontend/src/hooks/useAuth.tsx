import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getMe, login as loginRequest } from "../api/auth.api";
import type { Role, User } from "../api/types";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  hasRole: (roles: Role[]) => boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("access_token"));
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(token));

  useEffect(() => {
    let active = true;
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    getMe()
      .then((currentUser) => {
        if (active) {
          setUser(currentUser);
        }
      })
      .catch(() => {
        localStorage.removeItem("access_token");
        if (active) {
          setToken(null);
          setUser(null);
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [token]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isLoading,
      async login(email, password) {
        const result = await loginRequest(email, password);
        localStorage.setItem("access_token", result.token);
        setToken(result.token);
        setUser(result.user);
        return result.user;
      },
      logout() {
        localStorage.removeItem("access_token");
        setToken(null);
        setUser(null);
      },
      hasRole(roles) {
        return Boolean(user && roles.includes(user.role));
      }
    }),
    [isLoading, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return value;
}
