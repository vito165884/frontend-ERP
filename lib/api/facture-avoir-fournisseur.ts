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

export type FactureAvoirFournisseurBaseInfo = {
  id: number;
  numFactureAvoirFourSurPage: number;
  date: string;
  idFournisseur: number;
  fournisseurName?: string | null;
  numFactureFournisseur?: number | null;
  accountingYearId: number;
  accountingYearName: string;
  totalExcludingTaxAmount: number;
  totalVATAmount: number;
  totalIncludingTaxAmount: number;
  statut: number;
  statutLibelle?: string | null;
};

export type GetFactureAvoirFournisseurWithSummariesResponse = {
  totalNetAmount: number;
  totalVatAmount: number;
  totalIncludingTaxAmount: number;
  factureAvoirFournisseurs: PagedList<FactureAvoirFournisseurBaseInfo>;
};

const toApiDateTime = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(
    d.getSeconds()
  )}`;
};

export function normalizeFactureAvoirFournisseurBaseInfo(i: unknown): FactureAvoirFournisseurBaseInfo {
  const r = i as Record<string, unknown>;
  return {
    id: Number(r.id ?? r.Id ?? 0),
    numFactureAvoirFourSurPage: Number(r.numFactureAvoirFourSurPage ?? r.NumFactureAvoirFourSurPage ?? 0),
    date: String(r.date ?? r.Date ?? ""),
    idFournisseur: Number(r.idFournisseur ?? r.IdFournisseur ?? 0),
    fournisseurName: (r.fournisseurName ?? r.FournisseurName ?? null) as string | null,
    numFactureFournisseur: (r.numFactureFournisseur ?? r.NumFactureFournisseur ?? null) as number | null,
    accountingYearId: Number(r.accountingYearId ?? r.AccountingYearId ?? 0),
    accountingYearName: String(r.accountingYearName ?? r.AccountingYearName ?? ""),
    totalExcludingTaxAmount: Number(r.totalExcludingTaxAmount ?? r.TotalExcludingTaxAmount ?? 0),
    totalVATAmount: Number(r.totalVATAmount ?? r.TotalVATAmount ?? 0),
    totalIncludingTaxAmount: Number(r.totalIncludingTaxAmount ?? r.TotalIncludingTaxAmount ?? 0),
    statut: Number(r.statut ?? r.Statut ?? 0),
    statutLibelle: (r.statutLibelle ?? r.StatutLibelle ?? null) as string | null,
  };
}

export async function getFactureAvoirFournisseurSummaries(params: {
  pageNumber: number;
  pageSize: number;
  idFournisseur?: number | null;
  numFactureFournisseur?: number | null;
  sortOrder?: string | null;
  sortProperty?: string | null;
  searchKeyword?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
}): Promise<GetFactureAvoirFournisseurWithSummariesResponse> {
  const qs = new URLSearchParams();
  qs.set("pageNumber", String(params.pageNumber));
  qs.set("pageSize", String(params.pageSize));
  if (params.idFournisseur != null) qs.set("idFournisseur", String(params.idFournisseur));
  if (params.numFactureFournisseur != null) qs.set("numFactureFournisseur", String(params.numFactureFournisseur));
  if (params.sortOrder) qs.set("sortOrder", params.sortOrder);
  if (params.sortProperty) qs.set("sortProperty", params.sortProperty);
  if (params.searchKeyword) qs.set("searchKeyword", params.searchKeyword);
  if (params.startDate) qs.set("startDate", toApiDateTime(params.startDate));
  if (params.endDate) qs.set("endDate", toApiDateTime(params.endDate));

  const raw = await salesFetchJson<GetFactureAvoirFournisseurWithSummariesResponse>(
    `/facture-avoir-fournisseur/summaries?${qs.toString()}`
  );
  const paged = raw.factureAvoirFournisseurs;
  return {
    ...raw,
    factureAvoirFournisseurs: {
      ...paged,
      items: (paged?.items ?? []).map(normalizeFactureAvoirFournisseurBaseInfo),
    },
  };
}

export async function validateFactureAvoirFournisseurs(ids: number[]): Promise<void> {
  if (!ids.length) return;
  const res = await salesFetch(`/api/facture-avoir-fournisseurs/validate`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ids }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
}

export async function attachFactureAvoirFournisseurToInvoice(params: {
  factureAvoirFournisseurIds: number[];
  factureFournisseurId: number;
}): Promise<void> {
  const res = await salesFetch(`/facture-avoir-fournisseur/attach-to-invoice`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      factureAvoirFournisseurIds: params.factureAvoirFournisseurIds,
      factureFournisseurId: params.factureFournisseurId,
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
}

export async function detachFactureAvoirFournisseurFromInvoice(params: {
  factureAvoirFournisseurIds: number[];
  factureFournisseurId: number;
}): Promise<void> {
  const res = await salesFetch(`/facture-avoir-fournisseur/detach-from-invoice`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      factureAvoirFournisseurIds: params.factureAvoirFournisseurIds,
      factureFournisseurId: params.factureFournisseurId,
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
}
