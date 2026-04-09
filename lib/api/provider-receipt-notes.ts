import { salesFetch, salesFetchJson } from "@/lib/http";

export type ReceiptNoteBaseInfo = {
  number: number;
  date: string;
  providerId: number;
  providerName?: string | null;
  netAmount: number;
  vatAmount: number;
  grossAmount: number;
  statut: number;
  statutLibelle: string;
  supplierReceiptNumber: number;
};

export type ReceiptNoteTotalsResponse = {
  totalGrossAmount: number;
  totalVatAmount: number;
  totalNetAmount: number;
};

export type ReceiptNotesListResponse = {
  receiptNotes: ReceiptNoteBaseInfo[];
  totalCount: number;
  page: number;
  pageSize: number;
  totals: ReceiptNoteTotalsResponse;
};

const toApiDateTime = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(
    d.getSeconds()
  )}`;
};

function normalizeReceiptNoteBaseInfo(i: unknown): ReceiptNoteBaseInfo {
  const r = i as Record<string, unknown>;
  return {
    number: Number(r.number ?? r.Number ?? 0),
    date: String(r.date ?? r.Date ?? ""),
    providerId: Number(r.providerId ?? r.ProviderId ?? 0),
    providerName: (r.providerName ?? r.ProviderName ?? null) as string | null,
    netAmount: Number(r.netAmount ?? r.NetAmount ?? 0),
    vatAmount: Number(r.vatAmount ?? r.VatAmount ?? 0),
    grossAmount: Number(r.grossAmount ?? r.GrossAmount ?? 0),
    statut: Number(r.statut ?? r.Statut ?? 0),
    statutLibelle: String(r.statutLibelle ?? r.StatutLibelle ?? ""),
    supplierReceiptNumber: Number(r.supplierReceiptNumber ?? r.SupplierReceiptNumber ?? 0),
  };
}

export async function getReceiptNotesList(params: {
  startDate: Date | null;
  endDate: Date | null;
  providerId?: number | null;
  tagIds?: number[] | null;
  status?: number | null;
  page?: number;
  pageSize?: number;
  sortBy?: string | null;
  sortDescending?: boolean;
}): Promise<ReceiptNotesListResponse> {
  const qs = new URLSearchParams();
  if (params.startDate) qs.set("startDate", toApiDateTime(params.startDate));
  if (params.endDate) qs.set("endDate", toApiDateTime(params.endDate));
  if (params.providerId != null) qs.set("providerId", String(params.providerId));
  if (params.tagIds?.length) params.tagIds.forEach((id) => qs.append("tagIds", String(id)));
  if (params.status != null) qs.set("status", String(params.status));
  qs.set("page", String(params.page ?? 1));
  qs.set("pageSize", String(params.pageSize ?? 50));
  if (params.sortBy) qs.set("sortBy", params.sortBy);
  qs.set("sortDescending", String(params.sortDescending ?? false));

  const raw = await salesFetchJson<ReceiptNotesListResponse>(`/api/receipt-notes/list?${qs.toString()}`);
  return {
    ...raw,
    receiptNotes: (raw.receiptNotes ?? []).map(normalizeReceiptNoteBaseInfo),
    totals: {
      totalGrossAmount: Number(raw.totals?.totalGrossAmount ?? 0),
      totalVatAmount: Number(raw.totals?.totalVatAmount ?? 0),
      totalNetAmount: Number(raw.totals?.totalNetAmount ?? 0),
    },
  };
}

/** `ids` are receipt note numbers (`BonDeReception.Num`). */
export async function validateReceiptNotes(nums: number[]): Promise<void> {
  if (!nums.length) return;
  const res = await salesFetch(`/api/receipt-notes/validate`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ids: nums }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
}
