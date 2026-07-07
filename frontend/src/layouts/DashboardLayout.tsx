import { BarChart3, Boxes, ClipboardList, LayoutDashboard, LogOut, Package, Receipt, ShoppingCart, Truck, Users, type LucideIcon } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import type { Role } from "../api/types";
import { useAuth } from "../hooks/useAuth";

const navItems: Array<{ to: string; label: string; icon: LucideIcon; roles: Role[] }> = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, roles: ["manager"] },
  { to: "/pos", label: "POS", icon: ShoppingCart, roles: ["manager", "salesperson"] },
  { to: "/products", label: "Products", icon: Package, roles: ["manager", "salesperson", "warehouse_staff"] },
  { to: "/customers", label: "Customers", icon: Users, roles: ["manager", "salesperson"] },
  { to: "/inventory", label: "Inventory", icon: Boxes, roles: ["manager", "salesperson", "warehouse_staff"] },
  { to: "/warehouse", label: "Warehouse", icon: Truck, roles: ["manager", "warehouse_staff"] },
  { to: "/invoices", label: "Invoices", icon: Receipt, roles: ["manager", "salesperson"] },
  { to: "/reports", label: "Reports", icon: BarChart3, roles: ["manager"] },
  { to: "/employees", label: "Employees", icon: ClipboardList, roles: ["manager"] }
];

export function DashboardLayout() {
  const { logout, user } = useAuth();
  const items = navItems.filter((item) => user && item.roles.includes(user.role));

  return (
    <div className="min-h-screen bg-panel text-ink lg:flex">
      <aside className="border-b border-slate-200 bg-ink text-white lg:fixed lg:inset-y-0 lg:w-64 lg:border-b-0">
        <div className="flex h-16 items-center justify-between px-5 lg:h-20">
          <div>
            <div className="text-lg font-semibold">ElectroStore</div>
            <div className="text-xs text-slate-300">Smart POS & Inventory</div>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:block lg:space-y-1 lg:overflow-visible">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex min-w-fit items-center gap-3 rounded px-3 py-2 text-sm font-medium ${
                    isActive ? "bg-circuit text-white" : "text-slate-200 hover:bg-white/10"
                  }`
                }
              >
                <Icon size={18} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      <main className="min-w-0 flex-1 lg:pl-64">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:px-8">
          <div>
            <p className="text-xs font-medium uppercase text-steel">ElectroStore Manager</p>
            <p className="text-sm font-semibold">{user?.full_name}</p>
          </div>
          <button className="focus-ring inline-flex items-center gap-2 rounded border border-slate-200 bg-white px-3 py-2 text-sm font-semibold" onClick={logout}>
            <LogOut size={16} />
            Sign out
          </button>
        </header>
        <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
