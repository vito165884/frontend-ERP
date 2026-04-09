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

export type ProviderCreditNoteBaseInfo = {
  id: number;
  numAvoirChezFournisseur: number;
  date: string; // DateTimeOffset serialized
  fournisseurId?: number | null;
  fournisseurName?: string | null;
  numFactureAvoirFournisseur?: number | null;
  accountingYearId: number;
  accountingYearName: string;
  totalExcludingTaxAmount: number;
  totalVATAmount: number;
  totalIncludingTaxAmount: number;
  statut: number;
  statutLibelle?: string | null;
};

export type GetProviderCreditNotesWithSummariesResponse = {
  totalNetAmount: number;
  totalVatAmount: number;
  totalIncludingTaxAmount: number;
  avoirFournisseurs: PagedList<ProviderCreditNoteBaseInfo>;
};

const toApiDateTime = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(
    d.getSeconds()
  )}`;
};

export function normalizeProviderCreditNoteBaseInfo(i: unknown): ProviderCreditNoteBaseInfo {
  const r = i as Record<string, unknown>;
  return {
    id: Number(r.id ?? r.Id ?? 0),
    numAvoirChezFournisseur: Number(r.numAvoirChezFournisseur ?? r.NumAvoirChezFournisseur ?? 0),
    date: String(r.date ?? r.Date ?? ""),
    fournisseurId: (r.fournisseurId ?? r.FournisseurId ?? null) as number | null,
    fournisseurName: (r.fournisseurName ?? r.FournisseurName ?? null) as string | null,
    numFactureAvoirFournisseur: (r.numFactureAvoirFournisseur ?? r.NumFactureAvoirFournisseur ?? null) as number | null,
    accountingYearId: Number(r.accountingYearId ?? r.AccountingYearId ?? 0),
    accountingYearName: String(r.accountingYearName ?? r.AccountingYearName ?? ""),
    totalExcludingTaxAmount: Number(r.totalExcludingTaxAmount ?? r.TotalExcludingTaxAmount ?? 0),
    totalVATAmount: Number(r.totalVATAmount ?? r.TotalVATAmount ?? 0),
    totalIncludingTaxAmount: Number(r.totalIncludingTaxAmount ?? r.TotalIncludingTaxAmount ?? 0),
    statut: Number(r.statut ?? r.Statut ?? 0),
    statutLibelle: (r.statutLibelle ?? r.StatutLibelle ?? null) as string | null,
  };
}

export async function getProviderCreditNotesWithSummaries(params: {
  pageNumber: number;
  pageSize: number;
  fournisseurId?: number | null;
  numFactureAvoirFournisseur?: number | null;
  sortOrder?: string | null;
  sortProperty?: string | null;
  searchKeyword?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
  status?: number | null;
  onlyUninvoiced?: boolean | null;
}): Promise<GetProviderCreditNotesWithSummariesResponse> {
  const qs = new URLSearchParams();
  qs.set("pageNumber", String(params.pageNumber));
  qs.set("pageSize", String(params.pageSize));
  if (params.fournisseurId != null) qs.set("fournisseurId", String(params.fournisseurId));
  if (params.numFactureAvoirFournisseur != null) qs.set("numFactureAvoirFournisseur", String(params.numFactureAvoirFournisseur));
  if (params.sortOrder) qs.set("sortOrder", params.sortOrder);
  if (params.sortProperty) qs.set("sortProperty", params.sortProperty);
  if (params.searchKeyword) qs.set("searchKeyword", params.searchKeyword);
  if (params.startDate) qs.set("startDate", toApiDateTime(params.startDate));
  if (params.endDate) qs.set("endDate", toApiDateTime(params.endDate));
  if (params.status !== undefined && params.status !== null) qs.set("status", String(params.status));
  if (params.onlyUninvoiced !== undefined && params.onlyUninvoiced !== null) qs.set("onlyUninvoiced", String(params.onlyUninvoiced));

  const raw = await salesFetchJson<GetProviderCreditNotesWithSummariesResponse>(`/avoir-fournisseur/summaries?${qs.toString()}`);
  const paged = raw.avoirFournisseurs;
  return {
    ...raw,
    avoirFournisseurs: {
      ...paged,
      items: (paged?.items ?? []).map(normalizeProviderCreditNoteBaseInfo),
    },
  };
}

export async function validateProviderCreditNotes(ids: number[]): Promise<void> {
  if (!ids.length) return;
  const res = await salesFetch(`/api/avoir-fournisseurs/validate`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(ids),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
}

export type AvoirFournisseurLineRequest = {
  refProduit: string;
  designationLi: string;
  qteLi: number;
  prixHt: number;
  remise: number;
  tva: number;
};

export type CreateAvoirFournisseurRequest = {
  date: string;
  fournisseurId: number | null;
  numFactureAvoirFournisseur?: number | null;
  numAvoirChezFournisseur: number;
  lines: AvoirFournisseurLineRequest[];
};

export async function createAvoirFournisseur(request: CreateAvoirFournisseurRequest): Promise<number> {
  const res = await salesFetch(`/avoir-fournisseur`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      date: request.date,
      fournisseurId: request.fournisseurId,
      numFactureAvoirFournisseur: request.numFactureAvoirFournisseur ?? null,
      numAvoirChezFournisseur: request.numAvoirChezFournisseur,
      lines: request.lines,
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
  const location = res.headers.get("location") ?? "";
  const last = location.split("/").filter(Boolean).at(-1);
  const n = last ? Number(last) : NaN;
  if (!Number.isFinite(n)) throw new Error("Create succeeded but could not read created id");
  return n;
}

