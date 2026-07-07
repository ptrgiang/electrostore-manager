import { FormEvent, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LogIn, ShieldCheck } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { getAllowedLandingPath } from "../lib/roleAccess";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("manager@electrostore.manager");
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
      navigate(getAllowedLandingPath(user.role, from), { replace: true });
    } catch {
      setError("Email or password is incorrect.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center px-4 py-8">
      <form className="panel w-full max-w-md overflow-hidden" onSubmit={handleSubmit}>
        <div className="bg-ink px-6 py-6 text-white">
          <div className="mb-5 inline-flex rounded bg-white/10 p-3 text-teal-100">
            <ShieldCheck size={24} />
          </div>
          <p className="text-xs font-semibold uppercase text-teal-200">ElectroStore Manager</p>
          <h1 className="mt-2 text-2xl font-semibold">Store Management System</h1>
          <p className="mt-2 text-sm text-slate-300">Smart POS & Inventory Management for Electronics Stores</p>
        </div>
        <div className="space-y-4 p-6">
          <div>
            <label className="block text-sm font-medium text-ink" htmlFor="email">
              Email
            </label>
            <input
              className="control mt-2 w-full"
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink" htmlFor="password">
              Password
            </label>
            <input
              className="control mt-2 w-full"
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          {error ? <div className="rounded border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div> : null}
          <button className="btn btn-primary w-full" disabled={isSubmitting}>
            <LogIn size={18} />
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
          <div className="rounded bg-slate-50 p-3 text-xs text-steel">
            Demo roles: manager, sales, warehouse. Password: <span className="font-semibold text-ink">Password123!</span>
          </div>
        </div>
      </form>
    </main>
  );
}
