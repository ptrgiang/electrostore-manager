import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, Plus, Search } from "lucide-react";
import { customersApi } from "../api/resources.api";
import type { Customer } from "../api/types";
import { DataTable } from "../components/DataTable";
import { Drawer } from "../components/Drawer";
import { ErrorState, LoadingState } from "../components/PageState";
import { PageHeader } from "../components/PageHeader";
import { StatusBadge } from "../components/StatusBadge";

const emptyCustomer: Partial<Customer> = { full_name: "", phone: "", email: "", address: "" };

function money(value: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value || 0);
}

export function CustomersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Customer | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [form, setForm] = useState<Partial<Customer>>(emptyCustomer);
  const [historyId, setHistoryId] = useState<number | null>(null);
  const query = useQuery({ queryKey: ["customers", search], queryFn: () => customersApi.list({ search }) });
  const history = useQuery({ queryKey: ["customer-history", historyId], queryFn: () => customersApi.history(historyId!), enabled: Boolean(historyId) });
  const selectedCustomer = (query.data || []).find((customer) => customer.id === historyId);
  const save = useMutation({
    mutationFn: () => (editing ? customersApi.update(editing.id, form) : customersApi.create(form)),
    onSuccess: () => {
      closeDrawer();
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    }
  });

  function openNew() {
    setEditing(null);
    setForm(emptyCustomer);
    setIsDrawerOpen(true);
  }

  function openEdit(customer: Customer) {
    setEditing(customer);
    setForm(customer);
    setIsDrawerOpen(true);
  }

  function closeDrawer() {
    setEditing(null);
    setForm(emptyCustomer);
    setIsDrawerOpen(false);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    save.mutate();
  }

  return (
    <section className="space-y-5">
      <PageHeader
        title="Customers"
        description="Profiles, phone lookup, tiers, points, and purchase history."
        actions={<button className="btn btn-primary" onClick={openNew}>
          <Plus size={16} />
          New customer
        </button>}
      />
      <div className="panel relative p-4">
        <Search className="pointer-events-none absolute left-7 top-6 text-steel" size={16} />
        <input className="control w-full pl-9" placeholder="Search by phone, name, or email" value={search} onChange={(event) => setSearch(event.target.value)} />
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0">
          {query.isLoading ? <LoadingState label="Loading customers..." /> : null}
          {query.isError ? <ErrorState label="Could not load customers." onRetry={() => query.refetch()} /> : null}
          {query.data ? (
            <DataTable<Customer>
              title="Customer Directory"
              meta={`${query.data.length} profiles`}
              empty="No customers found."
              rows={query.data}
              columns={[
                { key: "name", header: "Name", render: (row) => <span className="font-semibold text-ink">{row.full_name}</span>, sortValue: (row) => row.full_name },
                { key: "phone", header: "Phone", render: (row) => row.phone, sortValue: (row) => row.phone },
                { key: "email", header: "Email", render: (row) => row.email || "-", sortValue: (row) => row.email || "" },
                { key: "tier", header: "Tier", render: (row) => <span className="capitalize">{row.tier}</span>, sortValue: (row) => row.tier },
                { key: "points", header: "Points", align: "right", render: (row) => row.points, sortValue: (row) => row.points },
                { key: "created", header: "Created", render: (row) => new Date(row.created_at).toLocaleDateString(), sortValue: (row) => new Date(row.created_at) },
                {
                  key: "actions",
                  header: "Actions",
                  render: (row) => (
                    <div className="flex gap-2">
                      <button className="btn btn-soft px-3 py-1.5 text-xs" onClick={() => openEdit(row)}>Edit</button>
                      <button className="btn btn-soft px-3 py-1.5 text-xs" onClick={() => setHistoryId(row.id)}>History</button>
                    </div>
                  )
                }
              ]}
            />
          ) : null}
        </div>
        <aside className="panel min-w-0 p-4">
          <div className="section-title">
            <h2>Purchase History</h2>
            {historyId ? <button className="btn btn-soft px-3 py-1.5 text-xs" onClick={() => setHistoryId(null)}>Clear</button> : null}
          </div>
          {!historyId ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-steel">
              Select a customer to view invoices, points, and recent purchases.
            </div>
          ) : null}
          {history.isLoading ? <LoadingState label="Loading history..." /> : null}
          {history.data ? (
            <div className="space-y-2">
              {selectedCustomer ? (
                <div className="rounded-xl border border-line bg-white p-3 text-sm">
                  <p className="font-semibold text-ink">{selectedCustomer.full_name}</p>
                  <p className="mt-1 text-xs text-steel">{selectedCustomer.phone} - <span className="capitalize">{selectedCustomer.tier}</span> - {selectedCustomer.points} points</p>
                </div>
              ) : null}
              {history.data.length === 0 ? <p className="text-sm text-steel">No invoices found for the selected customer.</p> : null}
              {history.data.slice(0, 6).map((invoice) => (
                <div key={invoice.id} className="rounded-xl border border-line bg-slate-50 p-3 text-sm">
                  <div className="flex justify-between gap-3">
                    <span className="font-semibold text-ink">{invoice.invoice_code}</span>
                    <span className="font-semibold tabular-nums">{money(invoice.total_amount)}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <p className="text-xs text-steel">{new Date(invoice.created_at).toLocaleString()}</p>
                    <StatusBadge value={invoice.status} />
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </aside>
      </div>
      <Drawer title={editing ? "Edit customer" : "New customer"} description="Keep customer profiles concise for fast phone lookup at POS." isOpen={isDrawerOpen} onClose={closeDrawer}>
        <form className="space-y-4" onSubmit={submit}>
          <div>
            <label className="field-label">Full name</label>
            <input className="control w-full" value={form.full_name || ""} onChange={(event) => setForm({ ...form, full_name: event.target.value })} required />
          </div>
          <div>
            <label className="field-label">Phone</label>
            <input className="control w-full" value={form.phone || ""} onChange={(event) => setForm({ ...form, phone: event.target.value })} required />
          </div>
          <div>
            <label className="field-label">Email</label>
            <input className="control w-full" type="email" value={form.email || ""} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          </div>
          <div>
            <label className="field-label">Address</label>
            <textarea className="control min-h-24 w-full" value={form.address || ""} onChange={(event) => setForm({ ...form, address: event.target.value })} />
          </div>
          <div className="flex justify-end gap-2 border-t border-line pt-4">
            <button className="btn btn-soft" type="button" onClick={closeDrawer}>Cancel</button>
            <button className="btn btn-primary" disabled={save.isPending}>
              <Edit size={16} />
              {editing ? "Save changes" : "Create customer"}
            </button>
          </div>
        </form>
      </Drawer>
    </section>
  );
}
