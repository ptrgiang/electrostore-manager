import { FormEvent, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const roleHome = {
  manager: "/",
  salesperson: "/pos",
  warehouse_staff: "/inventory"
} as const;

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("manager@electrostore.local");
  const [password, setPassword] = useState("Password123!");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const user = await login(email, password);
      const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname;
      navigate(from || roleHome[user.role], { replace: true });
    } catch {
      setError("Email or password is incorrect.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-panel px-4">
      <form className="panel w-full max-w-md p-6" onSubmit={handleSubmit}>
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase text-circuit">ElectroStore Manager</p>
          <h1 className="mt-2 text-2xl font-semibold text-ink">Store Management System</h1>
          <p className="mt-2 text-sm text-steel">Smart POS & Inventory Management for Electronics Stores</p>
        </div>
        <label className="block text-sm font-medium text-ink" htmlFor="email">
          Email
        </label>
        <input
          className="focus-ring mt-2 w-full rounded border border-slate-300 px-3 py-2"
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <label className="mt-4 block text-sm font-medium text-ink" htmlFor="password">
          Password
        </label>
        <input
          className="focus-ring mt-2 w-full rounded border border-slate-300 px-3 py-2"
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        {error ? <div className="mt-4 rounded border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div> : null}
        <button
          className="focus-ring mt-6 inline-flex w-full items-center justify-center gap-2 rounded bg-circuit px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting}
        >
          <LogIn size={18} />
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}
