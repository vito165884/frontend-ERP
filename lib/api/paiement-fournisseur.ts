import { salesFetch, salesFetchJson } from "@/lib/http";

export type PaiementFournisseurRow = {
  id: number;
  numeroTransactionBancaire?: string | null;
  fournisseurId: number;
  fournisseurNom?: string | null;
  accountingYearId: number;
  accountingYear: number;
  montant: number;
  datePaiement: string;
  methodePaiement: string;
  factureFournisseurIds: number[];
  bonDeReceptionIds: number[];
  numeroChequeTraite?: string | null;
  banqueId?: number | null;
  banqueNom?: string | null;
  dateEcheance?: string | null;
  commentaire?: string | null;
  documentStoragePath?: string | null;
  hasDocument: boolean;
  mois?: number | null;
  dateModification?: string | null;
};

export type PagedPaiementsFournisseur = {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  items: PaiementFournisseurRow[];
};

function normalizeRow(r: Record<string, unknown>): PaiementFournisseurRow {
  const factureFournisseurIds = r.factureFournisseurIds ?? r.FactureFournisseurIds;
  const bonDeReceptionIds = r.bonDeReceptionIds ?? r.BonDeReceptionIds;
  return {
    id: Number(r.id ?? r.Id ?? 0),
    numeroTransactionBancaire: (r.numeroTransactionBancaire ?? r.NumeroTransactionBancaire ?? null) as string | null,
    fournisseurId: Number(r.fournisseurId ?? r.FournisseurId ?? 0),
    fournisseurNom: (r.fournisseurNom ?? r.FournisseurNom ?? null) as string | null,
    accountingYearId: Number(r.accountingYearId ?? r.AccountingYearId ?? 0),
    accountingYear: Number(r.accountingYear ?? r.AccountingYear ?? 0),
    montant: Number(r.montant ?? r.Montant ?? 0),
    datePaiement: String(r.datePaiement ?? r.DatePaiement ?? ""),
    methodePaiement: String(r.methodePaiement ?? r.MethodePaiement ?? ""),
    factureFournisseurIds: Array.isArray(factureFournisseurIds)
      ? (factureFournisseurIds as unknown[]).map((x) => Number(x))
      : [],
    bonDeReceptionIds: Array.isArray(bonDeReceptionIds) ? (bonDeReceptionIds as unknown[]).map((x) => Number(x)) : [],
    numeroChequeTraite: (r.numeroChequeTraite ?? r.NumeroChequeTraite ?? null) as string | null,
    banqueId: (r.banqueId ?? r.BanqueId) != null ? Number(r.banqueId ?? r.BanqueId) : null,
    banqueNom: (r.banqueNom ?? r.BanqueNom ?? null) as string | null,
    dateEcheance: (r.dateEcheance ?? r.DateEcheance) != null ? String(r.dateEcheance ?? r.DateEcheance) : null,
    commentaire: (r.commentaire ?? r.Commentaire ?? null) as string | null,
    documentStoragePath: (r.documentStoragePath ?? r.DocumentStoragePath ?? null) as string | null,
    hasDocument: Boolean(r.hasDocument ?? r.HasDocument ?? false),
    mois: (r.mois ?? r.Mois) != null ? Number(r.mois ?? r.Mois) : null,
    dateModification: (r.dateModification ?? r.DateModification) != null ? String(r.dateModification ?? r.DateModification) : null,
  };
}

export type GetPaiementsFournisseurParams = {
  pageNumber?: number;
  pageSize?: number;
  fournisseurId?: number | null;
  accountingYearIds?: number[] | null;
  datePaiementFrom?: string | null;
  datePaiementTo?: string | null;
  dateEcheanceFrom?: string | null;
  dateEcheanceTo?: string | null;
  montantMin?: number | null;
  montantMax?: number | null;
  hasNumeroTransactionBancaire?: boolean | null;
  mois?: number | null;
};

export async function getPaiementsFournisseur(params: GetPaiementsFournisseurParams): Promise<PagedPaiementsFournisseur> {
  const qs = new URLSearchParams();
  qs.set("pageNumber", String(params.pageNumber ?? 1));
  qs.set("pageSize", String(Math.min(params.pageSize ?? 50, 50)));
  if (params.fournisseurId != null) qs.set("fournisseurId", String(params.fournisseurId));
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
  if (params.mois != null) qs.set("mois", String(params.mois));

  const raw = await salesFetchJson<Record<string, unknown>>(`/paiement-fournisseur?${qs.toString()}`);
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

export async function deletePaiementFournisseur(id: number): Promise<void> {
  const res = await salesFetch(`/paiement-fournisseur/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
}

export type ExportPaiementsFournisseurParams = {
  fournisseurId?: number | null;
  accountingYearIds?: number[] | null;
  dateEcheanceFrom?: string | null;
  dateEcheanceTo?: string | null;
  montantMin?: number | null;
  montantMax?: number | null;
  hasNumeroTransactionBancaire?: boolean | null;
  mois?: number | null;
};

function buildExportQs(p: ExportPaiementsFournisseurParams): string {
  const qs = new URLSearchParams();
  if (p.fournisseurId != null) qs.set("fournisseurId", String(p.fournisseurId));
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
  if (p.mois != null) qs.set("mois", String(p.mois));
  return qs.toString();
}

export async function exportPaiementsFournisseurExcel(p: ExportPaiementsFournisseurParams): Promise<Blob> {
  const q = buildExportQs(p);
  const res = await salesFetch(`/api/paiement-fournisseur/export/excel${q ? `?${q}` : ""}`, {
    method: "GET",
    headers: { accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, */*" },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
  return await res.blob();
}

export async function exportPaiementsFournisseurPdf(p: ExportPaiementsFournisseurParams): Promise<Blob> {
  const q = buildExportQs(p);
  const res = await salesFetch(`/api/paiement-fournisseur/export/pdf${q ? `?${q}` : ""}`, {
    method: "GET",
    headers: { accept: "application/pdf, */*" },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
  return await res.blob();
}
