import { useQuery } from "@tanstack/react-query";
import { employeesApi } from "../api/resources.api";
import type { User } from "../api/types";
import { DataTable } from "../components/DataTable";
import { ErrorState, LoadingState } from "../components/PageState";
import { PageHeader } from "../components/PageHeader";
import { StatusBadge } from "../components/StatusBadge";
import { MetricCard } from "../components/MetricCard";

export function EmployeesPage() {
  const employees = useQuery({ queryKey: ["employees"], queryFn: employeesApi.list });

  if (employees.isLoading) {
    return <LoadingState label="Loading employees..." />;
  }

  if (employees.isError) {
    return <ErrorState label="Could not load employees." onRetry={() => employees.refetch()} />;
  }

  return (
    <section className="space-y-5">
      <PageHeader title="Employees" description="Manager-only roster and role visibility for the MVP." />
      <div className="grid gap-3 md:grid-cols-4">
        <MetricCard label="Total Staff" value={employees.data?.length || 0} detail="Active demo roster" />
        <MetricCard label="Managers" value={(employees.data || []).filter((employee) => employee.role === "manager").length} detail="Full access" />
        <MetricCard label="Salespeople" value={(employees.data || []).filter((employee) => employee.role === "salesperson").length} detail="POS and customer workflows" />
        <MetricCard label="Warehouse Staff" value={(employees.data || []).filter((employee) => employee.role === "warehouse_staff").length} detail="Stock movement workflows" />
      </div>
      <DataTable<User>
        title="Team Access"
        meta={`${employees.data?.length || 0} staff`}
        empty="No employees found."
        rows={employees.data || []}
        columns={[
          { key: "name", header: "Name", render: (row) => <span className="font-semibold text-ink">{row.full_name}</span>, sortValue: (row) => row.full_name },
          { key: "email", header: "Email", render: (row) => row.email, sortValue: (row) => row.email },
          { key: "role", header: "Role", render: (row) => <StatusBadge value={row.role} />, sortValue: (row) => row.role }
        ]}
      />
    </section>
  );
}
