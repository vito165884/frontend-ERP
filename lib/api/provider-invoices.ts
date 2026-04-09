import { salesFetch, salesFetchJson } from "@/lib/http";

function toApiDateTime(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}:${pad(d.getSeconds())}`;
}

export type ProviderInvoiceBaseInfo = {
  number: number;
  date: string;
  providerId: number;
  providerName?: string | null;
  netAmount: number;
  vatAmount: number;
  statut: number;
  statutLibelle: string;
  providerInvoiceNumber: number;
};

type ODataEnvelope<T> = { value: T[]; ["@odata.count"]?: number };

export function normalizeProviderInvoiceBaseInfo(i: unknown): ProviderInvoiceBaseInfo {
  const r = i as Record<string, unknown>;
  return {
    number: Number(r.number ?? r.Number ?? 0),
    date: String(r.date ?? r.Date ?? ""),
    providerId: Number(r.providerId ?? r.ProviderId ?? 0),
    providerName: (r.providerName ?? r.ProviderName ?? null) as string | null,
    netAmount: Number(r.netAmount ?? r.NetAmount ?? 0),
    vatAmount: Number(r.vatAmount ?? r.VatAmount ?? 0),
    statut: Number(r.statut ?? r.Statut ?? 0),
    statutLibelle: String(r.statutLibelle ?? r.StatutLibelle ?? ""),
    providerInvoiceNumber: Number(r.providerInvoiceNumber ?? r.ProviderInvoiceNumber ?? 0),
  };
}

export async function validateProviderInvoices(ids: number[]): Promise<void> {
  if (!ids.length) return;
  await salesFetchJson("/api/provider-invoices/validate", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ids }),
  });
}

export type ProviderInvoiceTotalsResponse = {
  totalHT: number;
  totalBase7: number;
  totalBase13: number;
  totalBase19: number;
  totalVat7: number;
  totalVat13: number;
  totalVat19: number;
  totalVat: number;
  totalTTC: number;
};

function normalizeTotals(raw: Record<string, unknown>): ProviderInvoiceTotalsResponse {
  return {
    totalHT: Number(raw.totalHT ?? raw.TotalHT ?? 0),
    totalBase7: Number(raw.totalBase7 ?? raw.TotalBase7 ?? 0),
    totalBase13: Number(raw.totalBase13 ?? raw.TotalBase13 ?? 0),
    totalBase19: Number(raw.totalBase19 ?? raw.TotalBase19 ?? 0),
    totalVat7: Number(raw.totalVat7 ?? raw.TotalVat7 ?? 0),
    totalVat13: Number(raw.totalVat13 ?? raw.TotalVat13 ?? 0),
    totalVat19: Number(raw.totalVat19 ?? raw.TotalVat19 ?? 0),
    totalVat: Number(raw.totalVat ?? raw.TotalVat ?? 0),
    totalTTC: Number(raw.totalTTC ?? raw.TotalTTC ?? 0),
  };
}

export async function getProviderInvoiceTotals(params: {
  startDate: Date | null;
  endDate: Date | null;
  providerId?: number | null;
  tagIds?: number[] | null;
  status?: number | null;
}): Promise<ProviderInvoiceTotalsResponse> {
  const qs = new URLSearchParams();
  if (params.startDate) qs.set("startDate", toApiDateTime(params.startDate));
  if (params.endDate) qs.set("endDate", toApiDateTime(params.endDate));
  if (params.providerId != null) qs.set("providerId", String(params.providerId));
  if (params.tagIds?.length) params.tagIds.forEach((id) => qs.append("tagIds", String(id)));
  if (params.status != null) qs.set("status", String(params.status));
  const raw = await salesFetchJson<Record<string, unknown>>(`/api/provider-invoices/totals?${qs.toString()}`);
  return normalizeTotals(raw);
}

export async function fetchProviderInvoiceBaseInfos(params: {
  startDate: Date;
  endDate: Date;
  providerId?: number | null;
  tagIds?: number[];
}): Promise<ProviderInvoiceBaseInfo[]> {
  const qs = new URLSearchParams();
  qs.set("$top", "500");
  qs.set("$orderby", "Number desc");
  qs.set("startDate", toApiDateTime(params.startDate));
  qs.set("endDate", toApiDateTime(params.endDate));
  if (params.providerId) qs.set("providerId", String(params.providerId));
  if (params.tagIds?.length) params.tagIds.forEach((id) => qs.append("tagIds", String(id)));

  const res = await salesFetchJson<ODataEnvelope<ProviderInvoiceBaseInfo>>(
    `/odata/ProviderInvoiceBaseInfos?${qs.toString()}`
  );
  return (res.value ?? []).map(normalizeProviderInvoiceBaseInfo);
}

export async function exportProviderInvoicesSageErp(params: {
  startDate: Date | null;
  endDate: Date | null;
  providerId?: number | null;
  tagIds?: number[] | null;
}): Promise<Blob> {
  const qs = new URLSearchParams();
  if (params.startDate) qs.set("startDate", toApiDateTime(params.startDate));
  if (params.endDate) qs.set("endDate", toApiDateTime(params.endDate));
  if (params.providerId != null) qs.set("providerId", String(params.providerId));
  if (params.tagIds?.length) params.tagIds.forEach((id) => qs.append("tagIds", String(id)));
  const res = await salesFetch(`/api/provider-invoices/export/sage?${qs.toString()}`, {
    method: "GET",
    headers: { accept: "*/*" },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
  return await res.blob();
}
