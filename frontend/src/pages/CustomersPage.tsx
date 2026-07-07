import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, Plus, Search } from "lucide-react";
import { customersApi } from "../api/resources.api";
import type { Customer } from "../api/types";
import { DataTable } from "../components/DataTable";
import { ErrorState, LoadingState } from "../components/PageState";
import { PageHeader } from "../components/PageHeader";

const emptyCustomer: Partial<Customer> = { full_name: "", phone: "", email: "", address: "" };

export function CustomersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form, setForm] = useState<Partial<Customer>>(emptyCustomer);
  const [historyId, setHistoryId] = useState<number | null>(null);
  const query = useQuery({ queryKey: ["customers", search], queryFn: () => customersApi.list({ search }) });
  const history = useQuery({ queryKey: ["customer-history", historyId], queryFn: () => customersApi.history(historyId!), enabled: Boolean(historyId) });
  const save = useMutation({
    mutationFn: () => (editing ? customersApi.update(editing.id, form) : customersApi.create(form)),
    onSuccess: () => {
      setEditing(null);
      setForm(emptyCustomer);
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    }
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    save.mutate();
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title="Customers"
        description="Profiles, phone lookup, tiers, points, and purchase history."
        actions={<button className="btn btn-primary" onClick={() => { setEditing(null); setForm(emptyCustomer); }}>
          <Plus size={16} />
          New customer
        </button>}
      />
      <div className="panel relative p-4">
        <Search className="pointer-events-none absolute left-7 top-6 text-steel" size={16} />
        <input className="control w-full pl-9" placeholder="Search by phone, name, or email" value={search} onChange={(event) => setSearch(event.target.value)} />
      </div>
      <form className="panel grid gap-3 p-4 md:grid-cols-5" onSubmit={submit}>
        <div className="md:col-span-5">
          <h2 className="text-sm font-semibold text-ink">{editing ? "Edit customer" : "Create customer"}</h2>
        </div>
        <input className="control md:col-span-2" placeholder="Full name" value={form.full_name || ""} onChange={(event) => setForm({ ...form, full_name: event.target.value })} required />
        <input className="control" placeholder="Phone" value={form.phone || ""} onChange={(event) => setForm({ ...form, phone: event.target.value })} required />
        <input className="control" type="email" placeholder="Email" value={form.email || ""} onChange={(event) => setForm({ ...form, email: event.target.value })} />
        <button className="btn btn-dark" disabled={save.isPending}>
          <Edit size={16} />
          {editing ? "Save" : "Create"}
        </button>
      </form>
      {query.isLoading ? <LoadingState label="Loading customers..." /> : null}
      {query.isError ? <ErrorState label="Could not load customers." onRetry={() => query.refetch()} /> : null}
      {query.data ? (
        <DataTable<Customer>
          title="Customer Directory"
          meta={`${query.data.length} profiles`}
          empty="No customers found."
          rows={query.data}
          columns={[
            { key: "name", header: "Name", render: (row) => row.full_name },
            { key: "phone", header: "Phone", render: (row) => row.phone },
            { key: "email", header: "Email", render: (row) => row.email || "-" },
            { key: "tier", header: "Tier", render: (row) => <span className="capitalize">{row.tier}</span> },
            { key: "points", header: "Points", render: (row) => row.points },
            { key: "created", header: "Created At", render: (row) => new Date(row.created_at).toLocaleDateString() },
            {
              key: "actions",
              header: "Actions",
              render: (row) => (
                <div className="flex gap-2">
                  <button className="btn btn-soft px-3 py-1 text-xs" onClick={() => { setEditing(row); setForm(row); }}>Edit</button>
                  <button className="btn btn-soft px-3 py-1 text-xs" onClick={() => setHistoryId(row.id)}>History</button>
                </div>
              )
            }
          ]}
        />
      ) : null}
      {historyId ? (
        <div className="panel p-4">
          <div className="section-title">
            <h2>Purchase history</h2>
            <button className="btn btn-soft px-3 py-1 text-xs" onClick={() => setHistoryId(null)}>Close</button>
          </div>
          <p className="text-sm text-steel">{history.isLoading ? "Loading..." : `${history.data?.length || 0} invoices found for the selected customer.`}</p>
        </div>
      ) : null}
    </section>
  );
}
