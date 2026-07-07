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
        <Route index element={<RequireAuth roles={["manager"]}><DashboardPage /></RequireAuth>} />
        <Route path="pos" element={<RequireAuth roles={["manager", "salesperson"]}><POSPage /></RequireAuth>} />
        <Route path="products" element={<RequireAuth roles={["manager", "salesperson", "warehouse_staff"]}><ProductsPage /></RequireAuth>} />
        <Route path="customers" element={<RequireAuth roles={["manager", "salesperson"]}><CustomersPage /></RequireAuth>} />
        <Route path="inventory" element={<RequireAuth roles={["manager", "salesperson", "warehouse_staff"]}><InventoryPage /></RequireAuth>} />
        <Route path="warehouse" element={<RequireAuth roles={["manager", "warehouse_staff"]}><WarehousePage /></RequireAuth>} />
        <Route path="invoices" element={<RequireAuth roles={["manager", "salesperson"]}><InvoicesPage /></RequireAuth>} />
        <Route path="reports" element={<RequireAuth roles={["manager"]}><ReportsPage /></RequireAuth>} />
        <Route path="employees" element={<RequireAuth roles={["manager"]}><EmployeesPage /></RequireAuth>} />
      </Route>
      <Route path="/unauthorized" element={<div className="grid min-h-screen place-items-center text-sm font-semibold text-rose-700">Unauthorized</div>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
