import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BadgeDollarSign, CreditCard, Minus, PackageCheck, Plus, Search, ShoppingCart, Trash2, UserRound } from "lucide-react";
import { customersApi, invoicesApi, productsApi } from "../api/resources.api";
import type { Customer, Product } from "../api/types";
import { EmptyState, ErrorState, LoadingState } from "../components/PageState";
import { PageHeader } from "../components/PageHeader";

type CartItem = {
  product: Product;
  quantity: number;
};

function money(value: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value || 0);
}

export function POSPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [phone, setPhone] = useState("");
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [discountType, setDiscountType] = useState<"fixed" | "percent">("fixed");
  const [discountValue, setDiscountValue] = useState(0);
  const [amountReceived, setAmountReceived] = useState(0);
  const [success, setSuccess] = useState<string | null>(null);

  const products = useQuery({ queryKey: ["pos-products", search], queryFn: () => productsApi.list({ search }) });
  const customerLookup = useMutation({
    mutationFn: customersApi.searchPhone,
    onSuccess: (result) => setCustomer(result)
  });
  const createCustomer = useMutation({
    mutationFn: () => customersApi.create({ full_name: `Customer ${phone}`, phone }),
    onSuccess: (result) => setCustomer(result)
  });
  const checkout = useMutation({
    mutationFn: () =>
      invoicesApi.createSale({
        customer_id: customer?.id,
        payment_method: paymentMethod,
        discount_type: discountValue > 0 ? discountType : undefined,
        discount_value: discountValue,
        amount_received: amountReceived,
        items: cart.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
          unit_price: item.product.selling_price
        }))
      }),
    onSuccess: (result) => {
      setSuccess(`${result.invoice.invoice_code} completed. Change: ${money(result.change_amount)}`);
      setCart([]);
      setDiscountValue(0);
      setAmountReceived(0);
      queryClient.invalidateQueries();
    }
  });

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.quantity * item.product.selling_price, 0), [cart]);
  const discountAmount = discountType === "percent" ? Math.min(subtotal, (subtotal * discountValue) / 100) : Math.min(subtotal, discountValue);
  const total = subtotal - discountAmount;
  const change = amountReceived - total;
  const cartQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

  function addProduct(product: Product) {
    if (!product.is_active || product.stock_qty <= 0) {
      return;
    }
    setSuccess(null);
    setCart((items) => {
      const existing = items.find((item) => item.product.id === product.id);
      if (existing) {
        return items.map((item) => (item.product.id === product.id ? { ...item, quantity: Math.min(item.quantity + 1, product.stock_qty) } : item));
      }
      return [...items, { product, quantity: 1 }];
    });
  }

  function adjust(productId: number, delta: number) {
    setCart((items) =>
      items
        .map((item) => (item.product.id === productId ? { ...item, quantity: Math.max(0, Math.min(item.quantity + delta, item.product.stock_qty)) } : item))
        .filter((item) => item.quantity > 0)
    );
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    checkout.mutate();
  }

  return (
    <section className="space-y-5">
      <PageHeader
        title="POS"
        description="Fast product lookup, cart edits, customer selection, and checkout for daily cashier work."
        actions={<span className="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-semibold text-steel">{cartQuantity} items in cart</span>}
      />
      {success ? <div className="panel border-teal-200 bg-teal-50 p-4 text-sm font-semibold text-teal-700">{success}</div> : null}
      {checkout.isError ? <ErrorState label="Checkout failed. Check stock and payment inputs." /> : null}
      <div className="grid min-h-[calc(100vh-12rem)] gap-4 xl:grid-cols-[minmax(320px,0.9fr)_minmax(380px,1.05fr)_360px] 2xl:grid-cols-[420px_1fr_390px]">
        <div className="space-y-3">
          <div className="panel p-4">
            <label className="field-label" htmlFor="product-search">Product search / barcode</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 text-steel" size={16} />
              <input id="product-search" className="control w-full pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Scan SKU or search name" />
            </div>
          </div>
          <div className="panel flex min-h-[520px] flex-col p-4">
            <div className="section-title">
              <h2 className="flex items-center gap-2"><PackageCheck size={18} /> Products</h2>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-steel">{products.data?.length || 0} matches</span>
            </div>
            {products.isLoading ? <LoadingState label="Loading products..." /> : null}
            <div className="mt-2 grid flex-1 content-start gap-2 overflow-y-auto pr-1 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              {(products.data || []).slice(0, 12).map((product) => {
                const isUnavailable = !product.is_active || product.stock_qty <= 0;
                return (
                  <button key={product.id} className="focus-ring rounded-xl border border-line bg-white p-3 text-left shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-70" disabled={isUnavailable} onClick={() => addProduct(product)}>
                    <span className="flex items-start justify-between gap-3">
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-ink">{product.name}</span>
                        <span className="mt-0.5 block text-xs text-steel">{product.sku}</span>
                      </span>
                      <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${product.stock_qty <= 0 ? "border-rose-200 bg-rose-50 text-rose-700" : product.stock_qty <= product.min_stock_qty ? "border-amber-200 bg-amber-50 text-amber-700" : "border-line bg-white text-steel"}`}>
                        {product.stock_qty <= 0 ? "Out of stock" : `${product.stock_qty} left`}
                      </span>
                    </span>
                    <span className="mt-3 flex items-end justify-between gap-3">
                      <span className="text-sm font-semibold tabular-nums text-ink">{money(product.selling_price)}</span>
                      <span className="text-xs text-steel">{product.category}</span>
                    </span>
                  </button>
                );
              })}
              {!products.isLoading && (products.data || []).length === 0 ? <div className="sm:col-span-2 xl:col-span-1 2xl:col-span-2"><EmptyState title="No products found." detail="Try another SKU, barcode, or product name." /></div> : null}
            </div>
          </div>
        </div>
        <div className="panel flex min-h-[620px] flex-col p-4">
          <div className="section-title">
            <h2 className="flex items-center gap-2"><ShoppingCart size={18} /> Cart</h2>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-steel">{cart.length} lines</span>
          </div>
          <div className="min-h-0 flex-1 divide-y divide-slate-100 overflow-y-auto pr-1">
            {cart.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/70 px-4 py-10 text-center">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-white text-steel shadow-sm"><ShoppingCart size={22} /></div>
                <p className="mt-4 text-sm font-semibold text-ink">Cart is empty</p>
                <p className="mt-1 text-xs text-steel">Scan barcode or select a product to start a sale.</p>
              </div>
            ) : null}
            {cart.map((item) => (
              <div key={item.product.id} className="grid grid-cols-[1fr_auto] gap-3 py-3.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">{item.product.name}</p>
                  <p className="text-xs text-steel">{item.product.sku} - Unit {money(item.product.selling_price)}</p>
                  <p className="mt-1 text-sm font-semibold tabular-nums text-ink">{money(item.quantity * item.product.selling_price)}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button className="btn btn-soft h-8 w-8 p-0" type="button" aria-label="Decrease quantity" onClick={() => adjust(item.product.id, -1)}><Minus size={14} /></button>
                  <span className="grid h-8 w-9 place-items-center rounded-lg border border-line bg-slate-50 text-sm font-semibold tabular-nums">{item.quantity}</span>
                  <button className="btn btn-soft h-8 w-8 p-0" type="button" aria-label="Increase quantity" onClick={() => adjust(item.product.id, 1)} disabled={item.quantity >= item.product.stock_qty}><Plus size={14} /></button>
                  <button className="btn btn-danger h-8 w-8 p-0" type="button" aria-label="Remove item" onClick={() => adjust(item.product.id, -item.quantity)}><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-xl border border-line bg-slate-50 p-3 text-sm">
            <div className="flex justify-between"><span className="text-steel">Subtotal</span><strong className="tabular-nums">{money(subtotal)}</strong></div>
            <div className="mt-1 flex justify-between"><span className="text-steel">Discount</span><strong className="tabular-nums text-ink">-{money(discountAmount)}</strong></div>
          </div>
        </div>
        <form className="panel sticky top-20 flex max-h-[calc(100vh-6rem)] min-h-[620px] flex-col p-4" onSubmit={submit}>
          <div className="section-title">
            <h2 className="flex items-center gap-2"><CreditCard size={18} /> Customer + Payment</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="field-label" htmlFor="phone">Customer phone</label>
              <div className="flex gap-2">
                <input id="phone" className="control min-w-0 flex-1" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Phone number" />
                <button type="button" className="btn btn-soft" onClick={() => customerLookup.mutate(phone)} disabled={!phone || customerLookup.isPending}>Find</button>
              </div>
              {phone && !customer && customerLookup.isSuccess ? (
                <button type="button" className="btn btn-soft mt-2 px-3 py-1.5 text-xs" onClick={() => createCustomer.mutate()}>Create walk-in customer</button>
              ) : null}
              <div className="mt-2 rounded-xl border border-line bg-slate-50 p-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-ink"><UserRound size={16} /> {customer ? customer.full_name : "Walk-in customer"}</div>
                <p className="mt-1 text-xs text-steel">{customer ? `${customer.points} loyalty points` : "No customer attached to this cart"}</p>
              </div>
            </div>
            <div>
              <label className="field-label">Payment method</label>
              <select className="control w-full" value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="transfer">Transfer</option>
                <option value="qr">QR</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="field-label">Discount</label>
                <select className="control w-full" value={discountType} onChange={(event) => setDiscountType(event.target.value as "fixed" | "percent")}>
                  <option value="fixed">Fixed</option>
                  <option value="percent">Percent</option>
                </select>
              </div>
              <div>
                <label className="field-label">Value</label>
                <input className="control w-full text-right tabular-nums" type="number" min={0} value={discountValue} onChange={(event) => setDiscountValue(Number(event.target.value))} />
              </div>
            </div>
            <div>
              <label className="field-label">Amount received</label>
              <input className="control w-full text-right tabular-nums" type="number" min={0} placeholder="Amount received" value={amountReceived} onChange={(event) => setAmountReceived(Number(event.target.value))} />
            </div>
          </div>
          <div className="mt-auto space-y-3 pt-5">
            <div className="space-y-2 rounded-xl border border-line bg-slate-50 p-4 text-sm">
              <div className="flex justify-between"><span className="text-steel">Subtotal</span><strong className="tabular-nums">{money(subtotal)}</strong></div>
              <div className="flex justify-between"><span className="text-steel">Discount</span><strong className="tabular-nums text-ink">-{money(discountAmount)}</strong></div>
              <div className="border-t border-line pt-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-ink">Total</span>
                  <strong className="text-2xl font-semibold tabular-nums text-ink">{money(total)}</strong>
                </div>
              </div>
              <div className="flex justify-between"><span className="text-steel">Amount received</span><strong className="tabular-nums text-ink">{money(amountReceived)}</strong></div>
              <div className="flex justify-between"><span className="text-steel">Change</span><strong className="tabular-nums text-ink">{money(Math.max(change, 0))}</strong></div>
            </div>
            <button className="btn btn-primary w-full py-3 text-base" disabled={cart.length === 0 || checkout.isPending}>
              <BadgeDollarSign size={18} />
              {checkout.isPending ? "Completing..." : "Complete Sale"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
