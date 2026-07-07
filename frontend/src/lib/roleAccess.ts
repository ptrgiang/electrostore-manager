import type { Role } from "../api/types";

export const roleHome: Record<Role, string> = {
  manager: "/",
  salesperson: "/pos",
  warehouse_staff: "/inventory"
};

export const routeRoles: Record<string, Role[]> = {
  dashboard: ["manager"],
  pos: ["manager", "salesperson"],
  products: ["manager", "salesperson", "warehouse_staff"],
  customers: ["manager", "salesperson"],
  inventory: ["manager", "salesperson", "warehouse_staff"],
  warehouse: ["manager", "warehouse_staff"],
  invoices: ["manager", "salesperson"],
  reports: ["manager"],
  employees: ["manager"]
};

const routeAccess: Array<{ path: string; roles: Role[] }> = [
  { path: "/", roles: routeRoles.dashboard },
  { path: "/pos", roles: routeRoles.pos },
  { path: "/products", roles: routeRoles.products },
  { path: "/customers", roles: routeRoles.customers },
  { path: "/inventory", roles: routeRoles.inventory },
  { path: "/warehouse", roles: routeRoles.warehouse },
  { path: "/invoices", roles: routeRoles.invoices },
  { path: "/reports", roles: routeRoles.reports },
  { path: "/employees", roles: routeRoles.employees }
];

export function getAllowedLandingPath(role: Role, requestedPath?: string | null) {
  if (!requestedPath || requestedPath === "/login" || requestedPath === "/unauthorized") {
    return roleHome[role];
  }

  const pathname = requestedPath.split(/[?#]/)[0] || "/";
  const route = routeAccess.find((item) => item.path === pathname);

  if (!route || !route.roles.includes(role)) {
    return roleHome[role];
  }

  return requestedPath;
}
