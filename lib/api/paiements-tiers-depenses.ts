import { salesFetch, salesFetchJson } from "@/lib/http";

export type PaiementTiersDepenseRow = {
  id: number;
  tiersDepenseFonctionnementId: number;
  tiersDepenseFonctionnementNom?: string | null;
  accountingYearId?: number | null;
  accountingYear?: number | null;
  montant: number;
  datePaiement: string;
  methodePaiement?: string | null;
  numeroTransactionBancaire?: string | null;
  commentaire?: string | null;
  hasDocument?: boolean;
};

export type PagedPaiementsTiersDepenses = {
  items: PaiementTiersDepenseRow[];
  totalCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

function normalizeRow(raw: unknown): PaiementTiersDepenseRow {
  const r = raw as Record<string, unknown>;
  return {
    id: Number(r.id ?? r.Id ?? 0),
    tiersDepenseFonctionnementId: Number(r.tiersDepenseFonctionnementId ?? r.TiersDepenseFonctionnementId ?? 0),
    tiersDepenseFonctionnementNom: (r.tiersDepenseFonctionnementNom ?? r.TiersDepenseFonctionnementNom ?? null) as string | null,
    accountingYearId: (r.accountingYearId ?? r.AccountingYearId ?? null) as number | null,
    accountingYear: (r.accountingYear ?? r.AccountingYear ?? null) as number | null,
    montant: Number(r.montant ?? r.Montant ?? 0),
    datePaiement: String(r.datePaiement ?? r.DatePaiement ?? ""),
    methodePaiement: (r.methodePaiement ?? r.MethodePaiement ?? null) as string | null,
    numeroTransactionBancaire: (r.numeroTransactionBancaire ?? r.NumeroTransactionBancaire ?? null) as string | null,
    commentaire: (r.commentaire ?? r.Commentaire ?? null) as string | null,
    hasDocument: Boolean(r.hasDocument ?? r.HasDocument ?? false),
  };
}

function normalizePaged(raw: unknown): PagedPaiementsTiersDepenses {
  const r = raw as Record<string, unknown>;
  const itemsRaw = (r.items ?? r.Items ?? []) as unknown;
  return {
    items: Array.isArray(itemsRaw) ? itemsRaw.map(normalizeRow) : [],
    totalCount: Number(r.totalCount ?? r.TotalCount ?? 0),
    pageSize: Number(r.pageSize ?? r.PageSize ?? 0),
    currentPage: Number(r.currentPage ?? r.CurrentPage ?? 0),
    totalPages: Number(r.totalPages ?? r.TotalPages ?? 0),
    hasNext: Boolean(r.hasNext ?? r.HasNext ?? false),
    hasPrevious: Boolean(r.hasPrevious ?? r.HasPrevious ?? false),
  };
}

export async function getPaiementsTiersDepenses(params?: {
  tiersDepenseFonctionnementId?: number | null;
  accountingYearId?: number | null;
  datePaiementFrom?: string | null;
  datePaiementTo?: string | null;
  pageNumber?: number;
  pageSize?: number;
}): Promise<PagedPaiementsTiersDepenses> {
  const qs = new URLSearchParams();
  qs.set("pageNumber", String(params?.pageNumber ?? 1));
  qs.set("pageSize", String(Math.min(params?.pageSize ?? 50, 50)));
  if (params?.tiersDepenseFonctionnementId != null) qs.set("tiersDepenseFonctionnementId", String(params.tiersDepenseFonctionnementId));
  if (params?.accountingYearId != null) qs.set("accountingYearId", String(params.accountingYearId));
  if (params?.datePaiementFrom) qs.set("datePaiementFrom", params.datePaiementFrom);
  if (params?.datePaiementTo) qs.set("datePaiementTo", params.datePaiementTo);
  const raw = await salesFetchJson<unknown>(`/paiements-tiers-depenses?${qs.toString()}`);
  return normalizePaged(raw);
}

export async function deletePaiementTiersDepense(id: number): Promise<void> {
  const res = await salesFetch(`/paiements-tiers-depenses/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
}

