import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Minus, Plus, Search, ShoppingCart, Trash2 } from "lucide-react";
import { customersApi, invoicesApi, productsApi } from "../api/resources.api";
import type { Customer, Product } from "../api/types";
import { ErrorState, LoadingState } from "../components/PageState";

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
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">POS</h1>
        <p className="text-sm text-steel">Search products, build a cart, lookup customers, and checkout.</p>
      </div>
      {success ? <div className="panel border-teal-200 bg-teal-50 p-4 text-sm font-semibold text-teal-700">{success}</div> : null}
      {checkout.isError ? <ErrorState label="Checkout failed. Check stock and payment inputs." /> : null}
      <div className="grid gap-5 xl:grid-cols-[1fr_1.2fr_440px]">
        <div className="space-y-4">
          <div className="panel p-4">
            <label className="text-sm font-medium" htmlFor="product-search">Product search / barcode</label>
            <div className="relative mt-2">
              <Search className="pointer-events-none absolute left-3 top-2.5 text-steel" size={16} />
              <input id="product-search" className="focus-ring w-full rounded border border-slate-300 py-2 pl-9 pr-3" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Scan SKU or search name" />
            </div>
          </div>
          <div className="panel p-4">
            <h2 className="font-semibold">Quick products</h2>
            {products.isLoading ? <LoadingState label="Loading products..." /> : null}
            <div className="mt-3 grid gap-2">
              {(products.data || []).slice(0, 8).map((product) => (
                <button key={product.id} className="focus-ring flex items-center justify-between rounded border border-slate-200 px-3 py-2 text-left hover:bg-slate-50 disabled:opacity-50" disabled={!product.is_active || product.stock_qty <= 0} onClick={() => addProduct(product)}>
                  <span>
                    <span className="block font-semibold">{product.name}</span>
                    <span className="text-xs text-steel">{product.sku} - Stock {product.stock_qty}</span>
                  </span>
                  <span className="font-semibold">{money(product.selling_price)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="panel p-4">
          <h2 className="flex items-center gap-2 font-semibold"><ShoppingCart size={18} /> Cart</h2>
          <div className="mt-3 divide-y divide-slate-100">
            {cart.length === 0 ? <p className="py-8 text-center text-sm text-steel">Cart is empty.</p> : null}
            {cart.map((item) => (
              <div key={item.product.id} className="grid grid-cols-[1fr_auto] gap-3 py-3">
                <div>
                  <p className="font-semibold">{item.product.name}</p>
                  <p className="text-xs text-steel">{item.product.sku} - {money(item.product.selling_price)}</p>
                  <p className="mt-1 text-sm font-semibold">{money(item.quantity * item.product.selling_price)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="focus-ring rounded border border-slate-200 p-2" aria-label="Decrease quantity" onClick={() => adjust(item.product.id, -1)}><Minus size={14} /></button>
                  <span className="w-8 text-center font-semibold">{item.quantity}</span>
                  <button className="focus-ring rounded border border-slate-200 p-2" aria-label="Increase quantity" onClick={() => adjust(item.product.id, 1)}><Plus size={14} /></button>
                  <button className="focus-ring rounded border border-rose-200 p-2 text-rose-700" aria-label="Remove item" onClick={() => adjust(item.product.id, -item.quantity)}><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <form className="panel space-y-4 p-4" onSubmit={submit}>
          <h2 className="font-semibold">Customer + Payment</h2>
          <div>
            <label className="text-sm font-medium" htmlFor="phone">Customer phone</label>
            <div className="mt-2 flex gap-2">
              <input id="phone" className="focus-ring min-w-0 flex-1 rounded border border-slate-300 px-3 py-2" value={phone} onChange={(event) => setPhone(event.target.value)} />
              <button type="button" className="focus-ring rounded border border-slate-200 px-3 py-2 font-semibold" onClick={() => customerLookup.mutate(phone)}>Find</button>
            </div>
            {phone && !customer && customerLookup.isSuccess ? (
              <button type="button" className="focus-ring mt-2 rounded border border-slate-200 px-3 py-1 text-sm" onClick={() => createCustomer.mutate()}>Create walk-in customer</button>
            ) : null}
            {customer ? <p className="mt-2 text-sm text-teal-700">{customer.full_name} - {customer.points} points</p> : null}
          </div>
          <select className="focus-ring w-full rounded border border-slate-300 px-3 py-2" value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="transfer">Transfer</option>
            <option value="qr">QR</option>
          </select>
          <div className="grid grid-cols-2 gap-2">
            <select className="focus-ring rounded border border-slate-300 px-3 py-2" value={discountType} onChange={(event) => setDiscountType(event.target.value as "fixed" | "percent")}>
              <option value="fixed">Fixed</option>
              <option value="percent">Percent</option>
            </select>
            <input className="focus-ring rounded border border-slate-300 px-3 py-2" type="number" min={0} value={discountValue} onChange={(event) => setDiscountValue(Number(event.target.value))} />
          </div>
          <input className="focus-ring w-full rounded border border-slate-300 px-3 py-2" type="number" min={0} placeholder="Amount received" value={amountReceived} onChange={(event) => setAmountReceived(Number(event.target.value))} />
          <div className="space-y-2 border-t border-slate-200 pt-3 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><strong>{money(subtotal)}</strong></div>
            <div className="flex justify-between"><span>Discount</span><strong>{money(discountAmount)}</strong></div>
            <div className="flex justify-between text-lg"><span>Total</span><strong>{money(total)}</strong></div>
            <div className="flex justify-between"><span>Change</span><strong>{money(change)}</strong></div>
          </div>
          <button className="focus-ring w-full rounded bg-circuit px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60" disabled={cart.length === 0 || checkout.isPending}>
            {checkout.isPending ? "Checking out..." : "Checkout"}
          </button>
        </form>
      </div>
    </section>
  );
}
