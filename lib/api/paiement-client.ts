import { salesFetch, salesFetchJson } from "@/lib/http";

export type PaiementClientRow = {
  id: number;
  numeroTransactionBancaire?: string | null;
  clientId: number;
  clientNom?: string | null;
  accountingYearId: number;
  accountingYear: number;
  montant: number;
  datePaiement: string;
  methodePaiement: string;
  factureIds: number[];
  bonDeLivraisonIds: number[];
  numeroChequeTraite?: string | null;
  banqueId?: number | null;
  banqueNom?: string | null;
  dateEcheance?: string | null;
  commentaire?: string | null;
  documentStoragePath?: string | null;
  dateModification?: string | null;
};

export type PagedPaiementsClient = {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  items: PaiementClientRow[];
};

function normalizeRow(r: Record<string, unknown>): PaiementClientRow {
  const factureIds = r.factureIds ?? r.FactureIds;
  const bonDeLivraisonIds = r.bonDeLivraisonIds ?? r.BonDeLivraisonIds;
  return {
    id: Number(r.id ?? r.Id ?? 0),
    numeroTransactionBancaire: (r.numeroTransactionBancaire ?? r.NumeroTransactionBancaire ?? null) as string | null,
    clientId: Number(r.clientId ?? r.ClientId ?? 0),
    clientNom: (r.clientNom ?? r.ClientNom ?? null) as string | null,
    accountingYearId: Number(r.accountingYearId ?? r.AccountingYearId ?? 0),
    accountingYear: Number(r.accountingYear ?? r.AccountingYear ?? 0),
    montant: Number(r.montant ?? r.Montant ?? 0),
    datePaiement: String(r.datePaiement ?? r.DatePaiement ?? ""),
    methodePaiement: String(r.methodePaiement ?? r.MethodePaiement ?? ""),
    factureIds: Array.isArray(factureIds) ? (factureIds as unknown[]).map((x) => Number(x)) : [],
    bonDeLivraisonIds: Array.isArray(bonDeLivraisonIds)
      ? (bonDeLivraisonIds as unknown[]).map((x) => Number(x))
      : [],
    numeroChequeTraite: (r.numeroChequeTraite ?? r.NumeroChequeTraite ?? null) as string | null,
    banqueId: (r.banqueId ?? r.BanqueId) != null ? Number(r.banqueId ?? r.BanqueId) : null,
    banqueNom: (r.banqueNom ?? r.BanqueNom ?? null) as string | null,
    dateEcheance: (r.dateEcheance ?? r.DateEcheance) != null ? String(r.dateEcheance ?? r.DateEcheance) : null,
    commentaire: (r.commentaire ?? r.Commentaire ?? null) as string | null,
    documentStoragePath: (r.documentStoragePath ?? r.DocumentStoragePath ?? null) as string | null,
    dateModification: (r.dateModification ?? r.DateModification) != null ? String(r.dateModification ?? r.DateModification) : null,
  };
}

export type GetPaiementsClientParams = {
  pageNumber?: number;
  pageSize?: number;
  clientId?: number | null;
  accountingYearIds?: number[] | null;
  datePaiementFrom?: string | null;
  datePaiementTo?: string | null;
  dateEcheanceFrom?: string | null;
  dateEcheanceTo?: string | null;
  montantMin?: number | null;
  montantMax?: number | null;
  hasNumeroTransactionBancaire?: boolean | null;
};

export async function getPaiementsClient(params: GetPaiementsClientParams): Promise<PagedPaiementsClient> {
  const qs = new URLSearchParams();
  qs.set("pageNumber", String(params.pageNumber ?? 1));
  qs.set("pageSize", String(Math.min(params.pageSize ?? 50, 50)));
  if (params.clientId != null) qs.set("clientId", String(params.clientId));
  if (params.accountingYearIds?.length) {
    for (const id of params.accountingYearIds) qs.append("accountingYearIds", String(id));
  }
  if (params.datePaiementFrom) qs.set("datePaiementFrom", params.datePaiementFrom);
  if (params.datePaiementTo) qs.set("datePaiementTo", params.datePaiementTo);
  if (params.dateEcheanceFrom) qs.set("dateEcheanceFrom", params.dateEcheanceFrom);
  if (params.dateEcheanceTo) qs.set("dateEcheanceTo", params.dateEcheanceTo);
  if (params.montantMin != null) qs.set("montantMin", String(params.montantMin));
  if (params.montantMax != null) qs.set("montantMax", String(params.montantMax));
  if (params.hasNumeroTransactionBancaire != null) {
    qs.set("hasNumeroTransactionBancaire", String(params.hasNumeroTransactionBancaire));
  }

  const raw = await salesFetchJson<Record<string, unknown>>(`/paiement-client?${qs.toString()}`);
  const itemsRaw = raw.items ?? raw.Items;
  const list = Array.isArray(itemsRaw) ? itemsRaw.map((x) => normalizeRow(x as Record<string, unknown>)) : [];

  return {
    currentPage: Number(raw.currentPage ?? raw.CurrentPage ?? 1),
    totalPages: Number(raw.totalPages ?? raw.TotalPages ?? 1),
    pageSize: Number(raw.pageSize ?? raw.PageSize ?? 50),
    totalCount: Number(raw.totalCount ?? raw.TotalCount ?? list.length),
    items: list,
  };
}

export async function deletePaiementClient(id: number): Promise<void> {
  const res = await salesFetch(`/paiement-client/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
}

export type ExportPaiementsClientExcelParams = {
  clientId?: number | null;
  accountingYearIds?: number[] | null;
  dateEcheanceFrom?: string | null;
  dateEcheanceTo?: string | null;
  montantMin?: number | null;
  montantMax?: number | null;
  hasNumeroTransactionBancaire?: boolean | null;
};

export async function exportPaiementsClientExcel(p: ExportPaiementsClientExcelParams): Promise<Blob> {
  const qs = new URLSearchParams();
  if (p.clientId != null) qs.set("clientId", String(p.clientId));
  if (p.accountingYearIds?.length) {
    for (const id of p.accountingYearIds) qs.append("accountingYearIds", String(id));
  }
  if (p.dateEcheanceFrom) qs.set("dateEcheanceFrom", p.dateEcheanceFrom);
  if (p.dateEcheanceTo) qs.set("dateEcheanceTo", p.dateEcheanceTo);
  if (p.montantMin != null) qs.set("montantMin", String(p.montantMin));
  if (p.montantMax != null) qs.set("montantMax", String(p.montantMax));
  if (p.hasNumeroTransactionBancaire != null) {
    qs.set("hasNumeroTransactionBancaire", String(p.hasNumeroTransactionBancaire));
  }

  const res = await salesFetch(`/api/paiement-client/export/excel?${qs.toString()}`, {
    method: "GET",
    headers: { accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, */*" },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
  return await res.blob();
}
