import { BarChart3, Boxes, CalendarDays, ClipboardList, LayoutDashboard, LogOut, Menu, Package, PanelLeftClose, PanelLeftOpen, Receipt, Search, ShoppingCart, Truck, Users, type LucideIcon } from "lucide-react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useMemo, useState } from "react";
import type { Role } from "../api/types";
import { useAuth } from "../hooks/useAuth";
import { routeRoles } from "../lib/roleAccess";

const navItems: Array<{ to: string; label: string; icon: LucideIcon; roles: Role[] }> = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, roles: routeRoles.dashboard },
  { to: "/pos", label: "POS", icon: ShoppingCart, roles: routeRoles.pos },
  { to: "/products", label: "Products", icon: Package, roles: routeRoles.products },
  { to: "/customers", label: "Customers", icon: Users, roles: routeRoles.customers },
  { to: "/inventory", label: "Inventory", icon: Boxes, roles: routeRoles.inventory },
  { to: "/warehouse", label: "Warehouse", icon: Truck, roles: routeRoles.warehouse },
  { to: "/invoices", label: "Invoices", icon: Receipt, roles: routeRoles.invoices },
  { to: "/reports", label: "Reports", icon: BarChart3, roles: routeRoles.reports },
  { to: "/employees", label: "Employees", icon: ClipboardList, roles: routeRoles.employees }
];

export function DashboardLayout() {
  const { logout, user } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const items = navItems.filter((item) => user && item.roles.includes(user.role));
  const currentItem = navItems.find((item) => item.to === location.pathname) || navItems[0];
  const today = useMemo(
    () => new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date()),
    []
  );
  const roleLabel = user?.role.replace("_", " ") || "staff";

  return (
    <div className="min-h-screen bg-panel text-ink lg:flex">
      <aside className={`border-b border-slate-800 bg-navy text-white shadow-xl transition-all lg:fixed lg:inset-y-0 lg:border-b-0 ${isCollapsed ? "lg:w-20" : "lg:w-72"}`}>
        <div className="flex h-16 items-center justify-between px-4 lg:h-20">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-circuit text-sm font-bold text-white shadow-sm">ES</div>
            {!isCollapsed ? (
              <div className="min-w-0">
                <div className="truncate text-lg font-semibold tracking-tight">ElectroStore</div>
                <div className="mt-0.5 truncate text-xs text-slate-400">POS & Inventory Ops</div>
              </div>
            ) : null}
          </div>
          <button className="btn hidden border-white/10 bg-white/5 p-2 text-slate-200 hover:bg-white/10 lg:inline-flex" type="button" aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"} onClick={() => setIsCollapsed((value) => !value)}>
            {isCollapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
          </button>
        </div>
        <div className={`mx-3 mb-3 hidden rounded-xl border border-white/10 bg-white/[0.06] p-3 lg:block ${isCollapsed ? "px-2 text-center" : ""}`}>
          <p className="truncate text-sm font-semibold">{isCollapsed ? user?.full_name.slice(0, 1) : user?.full_name}</p>
          {!isCollapsed ? <p className="mt-2 inline-flex rounded-full bg-circuit/15 px-2 py-1 text-xs font-semibold capitalize text-teal-100">{roleLabel}</p> : null}
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:block lg:space-y-1 lg:overflow-visible">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `group relative flex min-w-fit items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                    isActive ? "bg-white/10 text-white shadow-sm" : "text-slate-300 hover:bg-white/[0.07] hover:text-white"
                  }`
                }
                title={isCollapsed ? item.label : undefined}
              >
                {({ isActive }) => (
                  <>
                    <span className={`absolute left-0 h-5 w-1 rounded-r-full ${isActive ? "bg-circuit" : "bg-transparent"}`} />
                    <Icon className="shrink-0" size={18} />
                    {!isCollapsed ? <span>{item.label}</span> : null}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      <main className={`min-w-0 flex-1 transition-all ${isCollapsed ? "lg:pl-20" : "lg:pl-72"}`}>
        <header className="sticky top-0 z-10 border-b border-line bg-white/90 px-4 backdrop-blur lg:px-6">
          <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <Menu className="text-steel lg:hidden" size={18} />
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold uppercase tracking-wide text-steel">ElectroStore Manager / {currentItem.label}</p>
                <p className="truncate text-sm font-semibold text-ink">Store Management System</p>
              </div>
            </div>
            <div className="hidden min-w-[260px] max-w-md flex-1 items-center rounded-xl border border-line bg-slate-50 px-3 py-2 text-sm text-steel xl:flex">
              <Search size={16} className="mr-2 shrink-0" />
              Search products, invoices, customers
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-2 rounded-xl border border-line bg-white px-3 py-2 text-xs font-semibold text-steel md:flex">
                <CalendarDays size={15} />
                Today: {today}
              </div>
              <span className="hidden rounded-full border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-semibold capitalize text-circuit sm:inline-flex">
                {roleLabel}
              </span>
              <button className="btn btn-soft px-3 py-2" onClick={logout}>
                <LogOut size={16} />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          </div>
        </header>
        <div className="mx-auto max-w-[1440px] px-4 py-5 lg:px-6 lg:py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
