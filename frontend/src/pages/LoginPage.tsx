import { FormEvent, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Boxes, LogIn, Receipt, ShieldCheck } from "lucide-react";
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
    <main className="grid min-h-screen place-items-center bg-panel px-4 py-8">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl border border-line bg-white shadow-xl lg:grid-cols-[1fr_440px]">
        <section className="hidden bg-navy p-8 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="mb-5 inline-flex rounded-xl bg-white/10 p-3 text-teal-100">
              <ShieldCheck size={26} />
            </div>
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-200">ElectroStore Manager</p>
            <h1 className="mt-3 max-w-md text-3xl font-semibold tracking-tight">Operational control for electronics retail teams</h1>
            <p className="mt-3 max-w-md text-sm leading-6 text-slate-300">POS, inventory, warehouse movement, invoices, reports, and staff visibility in one compact dashboard.</p>
          </div>
          <div className="grid gap-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.06] p-4">
              <div className="flex items-center gap-3 text-sm font-semibold"><Receipt size={18} /> Cashier-ready POS</div>
              <p className="mt-1 text-xs text-slate-400">Fast cart building, customer lookup, and payment summaries.</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.06] p-4">
              <div className="flex items-center gap-3 text-sm font-semibold"><Boxes size={18} /> Inventory operations</div>
              <p className="mt-1 text-xs text-slate-400">Low-stock alerts, import/export history, and stock visibility.</p>
            </div>
          </div>
        </section>
        <form className="p-6 sm:p-8" onSubmit={handleSubmit}>
          <div className="lg:hidden">
            <div className="mb-5 inline-flex rounded-xl bg-teal-50 p-3 text-circuit">
              <ShieldCheck size={24} />
            </div>
            <p className="text-xs font-semibold uppercase tracking-wide text-circuit">ElectroStore Manager</p>
          </div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Sign in</h2>
          <p className="mt-1 text-sm text-steel">Use a demo account to access the store management workspace.</p>
          <div className="mt-6 space-y-4">
            <div>
              <label className="field-label" htmlFor="email">
                Email
              </label>
              <input
                className="control w-full"
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div>
              <label className="field-label" htmlFor="password">
                Password
              </label>
              <input
                className="control w-full"
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
            {error ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div> : null}
            <button className="btn btn-primary w-full py-3" disabled={isSubmitting}>
              <LogIn size={18} />
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
            <div className="rounded-xl border border-line bg-white p-3 text-xs text-steel shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-ink">Demo access</p>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 font-semibold text-steel">MVP</span>
              </div>
              <div className="mt-2 grid gap-1.5">
                <button className="rounded-lg px-2 py-1 text-left hover:bg-slate-50 hover:text-circuit" type="button" onClick={() => setEmail("manager@electrostore.manager")}>manager@electrostore.manager</button>
                <button className="rounded-lg px-2 py-1 text-left hover:bg-slate-50 hover:text-circuit" type="button" onClick={() => setEmail("sales@electrostore.manager")}>sales@electrostore.manager</button>
                <button className="rounded-lg px-2 py-1 text-left hover:bg-slate-50 hover:text-circuit" type="button" onClick={() => setEmail("warehouse@electrostore.manager")}>warehouse@electrostore.manager</button>
              </div>
              <p className="mt-2">Password: <span className="font-semibold text-ink">Password123!</span></p>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
