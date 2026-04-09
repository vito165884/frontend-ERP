import { salesFetch, salesFetchJson } from "@/lib/http";

export type PagedList<T> = {
  items: T[];
  totalCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

export type AvoirFinancierFournisseurBaseInfo = {
  id: number;
  num: number;
  numSurPage: number;
  date: string;
  description?: string | null;
  totTtc: number;
  numFactureFournisseur: number;
  providerId: number;
  providerName?: string | null;
  providerInvoiceNumber: number;
};

export type GetAvoirFinancierFournisseursWithSummariesResponse = {
  totalAmount: number;
  avoirFinancierFournisseurs: PagedList<AvoirFinancierFournisseurBaseInfo>;
};

const toApiDateTime = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(
    d.getSeconds()
  )}`;
};

export function normalizeAvoirFinancierFournisseurBaseInfo(i: unknown): AvoirFinancierFournisseurBaseInfo {
  const r = i as Record<string, unknown>;
  return {
    id: Number(r.id ?? r.Id ?? 0),
    num: Number(r.num ?? r.Num ?? 0),
    numSurPage: Number(r.numSurPage ?? r.NumSurPage ?? 0),
    date: String(r.date ?? r.Date ?? ""),
    description: (r.description ?? r.Description ?? null) as string | null,
    totTtc: Number(r.totTtc ?? r.TotTtc ?? 0),
    numFactureFournisseur: Number(r.numFactureFournisseur ?? r.NumFactureFournisseur ?? 0),
    providerId: Number(r.providerId ?? r.ProviderId ?? 0),
    providerName: (r.providerName ?? r.ProviderName ?? null) as string | null,
    providerInvoiceNumber: Number(r.providerInvoiceNumber ?? r.ProviderInvoiceNumber ?? 0),
  };
}

export async function getAvoirFinancierFournisseursWithSummaries(params: {
  pageNumber: number;
  pageSize: number;
  providerId?: number | null;
  numFactureFournisseur?: number | null;
  sortOrder?: string | null;
  sortProperty?: string | null;
  searchKeyword?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
}): Promise<GetAvoirFinancierFournisseursWithSummariesResponse> {
  const qs = new URLSearchParams();
  qs.set("pageNumber", String(params.pageNumber));
  qs.set("pageSize", String(params.pageSize));
  if (params.providerId != null) qs.set("providerId", String(params.providerId));
  if (params.numFactureFournisseur != null) qs.set("numFactureFournisseur", String(params.numFactureFournisseur));
  if (params.sortOrder) qs.set("sortOrder", params.sortOrder);
  if (params.sortProperty) qs.set("sortProperty", params.sortProperty);
  if (params.searchKeyword) qs.set("searchKeyword", params.searchKeyword);
  if (params.startDate) qs.set("startDate", toApiDateTime(params.startDate));
  if (params.endDate) qs.set("endDate", toApiDateTime(params.endDate));

  const raw = await salesFetchJson<GetAvoirFinancierFournisseursWithSummariesResponse>(
    `/avoir-financier-fournisseurs?${qs.toString()}`
  );
  const paged = raw.avoirFinancierFournisseurs;
  return {
    ...raw,
    avoirFinancierFournisseurs: {
      ...paged,
      items: (paged?.items ?? []).map(normalizeAvoirFinancierFournisseurBaseInfo),
    },
  };
}

/** API validates by business key `Num` (not row id). */
export async function validateAvoirFinancierFournisseurs(nums: number[]): Promise<void> {
  if (!nums.length) return;
  const res = await salesFetch(`/avoir-financier-fournisseurs/validate`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ids: nums }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
}

export async function deleteAvoirFinancierFournisseur(id: number): Promise<void> {
  const res = await salesFetch(`/avoir-financier-fournisseurs/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
}
