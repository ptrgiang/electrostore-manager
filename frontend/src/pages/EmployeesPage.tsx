import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { employeesApi } from "../api/resources.api";
import type { User } from "../api/types";
import { DataTable } from "../components/DataTable";
import { ErrorState, LoadingState } from "../components/PageState";
import { PageHeader } from "../components/PageHeader";
import { StatusBadge } from "../components/StatusBadge";
import { MetricCard } from "../components/MetricCard";

export function EmployeesPage() {
  const [roleFilter, setRoleFilter] = useState<"all" | User["role"]>("all");
  const employees = useQuery({ queryKey: ["employees"], queryFn: employeesApi.list });

  if (employees.isLoading) {
    return <LoadingState label="Loading employees..." />;
  }

  if (employees.isError) {
    return <ErrorState label="Could not load employees." onRetry={() => employees.refetch()} />;
  }

  const rows = (employees.data || []).filter((employee) => roleFilter === "all" || employee.role === roleFilter);

  return (
    <section className="space-y-5">
      <PageHeader title="Employees" description="Manager-only roster and role visibility for the MVP." />
      <div className="grid gap-3 md:grid-cols-4">
        <MetricCard label="Total Staff" value={employees.data?.length || 0} detail="Active demo roster" />
        <MetricCard label="Managers" value={(employees.data || []).filter((employee) => employee.role === "manager").length} detail="Full access" />
        <MetricCard label="Salespeople" value={(employees.data || []).filter((employee) => employee.role === "salesperson").length} detail="POS and customer workflows" />
        <MetricCard label="Warehouse Staff" value={(employees.data || []).filter((employee) => employee.role === "warehouse_staff").length} detail="Stock movement workflows" />
      </div>
      <div className="panel flex flex-wrap items-center gap-3 p-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-steel">Role</span>
        <div className="segmented">
          {(["all", "manager", "salesperson", "warehouse_staff"] as const).map((role) => (
            <button key={role} className={`segment ${roleFilter === role ? "segment-active" : ""}`} type="button" onClick={() => setRoleFilter(role)}>
              {role.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>
      <DataTable<User>
        title="Team Access"
        meta={`${rows.length} staff`}
        empty="No employees found."
        rows={rows}
        columns={[
          { key: "name", header: "Name", render: (row) => <span className="font-semibold text-ink">{row.full_name}</span>, sortValue: (row) => row.full_name },
          { key: "email", header: "Email", render: (row) => row.email, sortValue: (row) => row.email },
          { key: "role", header: "Role", render: (row) => <StatusBadge value={row.role} />, sortValue: (row) => row.role }
        ]}
      />
    </section>
  );
}
