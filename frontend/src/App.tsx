import { Navigate, Route, Routes } from "react-router-dom";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { RequireAuth } from "./hooks/useRoleGuard";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ProductsPage } from "./pages/ProductsPage";
import { CustomersPage } from "./pages/CustomersPage";
import { InventoryPage } from "./pages/InventoryPage";
import { WarehousePage } from "./pages/WarehousePage";
import { POSPage } from "./pages/POSPage";
import { InvoicesPage } from "./pages/InvoicesPage";
import { ReportsPage } from "./pages/ReportsPage";
import { EmployeesPage } from "./pages/EmployeesPage";
import { routeRoles } from "./lib/roleAccess";

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <RequireAuth>
            <DashboardLayout />
          </RequireAuth>
        }
      >
        <Route index element={<RequireAuth roles={routeRoles.dashboard}><DashboardPage /></RequireAuth>} />
        <Route path="pos" element={<RequireAuth roles={routeRoles.pos}><POSPage /></RequireAuth>} />
        <Route path="products" element={<RequireAuth roles={routeRoles.products}><ProductsPage /></RequireAuth>} />
        <Route path="customers" element={<RequireAuth roles={routeRoles.customers}><CustomersPage /></RequireAuth>} />
        <Route path="inventory" element={<RequireAuth roles={routeRoles.inventory}><InventoryPage /></RequireAuth>} />
        <Route path="warehouse" element={<RequireAuth roles={routeRoles.warehouse}><WarehousePage /></RequireAuth>} />
        <Route path="invoices" element={<RequireAuth roles={routeRoles.invoices}><InvoicesPage /></RequireAuth>} />
        <Route path="reports" element={<RequireAuth roles={routeRoles.reports}><ReportsPage /></RequireAuth>} />
        <Route path="employees" element={<RequireAuth roles={routeRoles.employees}><EmployeesPage /></RequireAuth>} />
      </Route>
      <Route path="/unauthorized" element={<div className="grid min-h-screen place-items-center text-sm font-semibold text-rose-700">Unauthorized</div>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
