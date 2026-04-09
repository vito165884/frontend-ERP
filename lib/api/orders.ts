import { salesFetch, salesFetchJson } from "@/lib/http";

export type OrderSummary = {
  orderNumber: number;
  supplierId: number | null;
  supplierName: string | null;
  date: string;
  totalExcludingVat: number;
  totalVat: number;
  netToPay: number;
  statut: number;
  statutLibelle: string;
};

function normalizeOrderSummary(i: unknown): OrderSummary {
  const r = i as Record<string, unknown>;
  return {
    orderNumber: Number(r.orderNumber ?? r.OrderNumber ?? 0),
    supplierId: (r.supplierId ?? r.SupplierId ?? null) as number | null,
    supplierName: (r.supplierName ?? r.SupplierName ?? null) as string | null,
    date: String(r.date ?? r.Date ?? ""),
    totalExcludingVat: Number(r.totalExcludingVat ?? r.TotalExcludingVat ?? 0),
    totalVat: Number(r.totalVat ?? r.TotalVat ?? 0),
    netToPay: Number(r.netToPay ?? r.NetToPay ?? 0),
    statut: Number(r.statut ?? r.Statut ?? 0),
    statutLibelle: String(r.statutLibelle ?? r.StatutLibelle ?? ""),
  };
}

export async function getOrdersList(): Promise<OrderSummary[]> {
  const raw = await salesFetchJson<unknown[]>(`/api/orders`);
  return (raw ?? []).map(normalizeOrderSummary);
}

/** Validates draft orders; `ids` are order numbers (`Num`). */
export async function validateOrders(orderNumbers: number[]): Promise<void> {
  if (!orderNumbers.length) return;
  const res = await salesFetch(`/api/orders/validate`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ids: orderNumbers }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
}
