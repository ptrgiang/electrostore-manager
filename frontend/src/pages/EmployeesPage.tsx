import { useQuery } from "@tanstack/react-query";
import { employeesApi } from "../api/resources.api";
import type { User } from "../api/types";
import { DataTable } from "../components/DataTable";
import { ErrorState, LoadingState } from "../components/PageState";

export function EmployeesPage() {
  const employees = useQuery({ queryKey: ["employees"], queryFn: employeesApi.list });

  if (employees.isLoading) {
    return <LoadingState label="Loading employees..." />;
  }

  if (employees.isError) {
    return <ErrorState label="Could not load employees." onRetry={() => employees.refetch()} />;
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Employees</h1>
        <p className="text-sm text-steel">Manager-only roster and role visibility for the MVP.</p>
      </div>
      <DataTable<User>
        empty="No employees found."
        rows={employees.data || []}
        columns={[
          { key: "name", header: "Name", render: (row) => row.full_name },
          { key: "email", header: "Email", render: (row) => row.email },
          { key: "role", header: "Role", render: (row) => <span className="capitalize">{row.role.replace("_", " ")}</span> }
        ]}
      />
    </section>
  );
}
