import { salesFetch, salesFetchJson } from "@/lib/http";

export type FactureRattacheeSolde = {
  numero: number;
  montantTtc: number;
};

export type PaiementSoldeClient = {
  id: number;
  numeroTransactionBancaire?: string | null;
  datePaiement: string;
  montant: number;
  methodePaiement: string;
  numeroChequeTraite?: string | null;
  banqueNom?: string | null;
  dateEcheance?: string | null;
  factures: FactureRattacheeSolde[];
};

export type DocumentSoldeClient = {
  type: string;
  id: number;
  numero: number;
  date: string;
  montant: number;
};

export type SoldeClientResponse = {
  clientId: number;
  clientNom: string;
  accountingYearId: number;
  totalFactures: number;
  totalBonsLivraisonNonFactures: number;
  totalAvoirs: number;
  totalFacturesAvoir: number;
  totalPaiements: number;
  solde: number;
  documents: DocumentSoldeClient[];
  paiements: PaiementSoldeClient[];
};

export type ClientSoldeProblemeRow = {
  clientId: number;
  clientNom: string;
  solde: number;
  nombreQuantitesNonLivrees: number;
  totalFactures: number;
  totalPaiements: number;
  dateDernierDocument: string | null;
};

export type PagedSoldes<T> = {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  items: T[];
};

function normalizeSolde(raw: Record<string, unknown>): SoldeClientResponse {
  const docs = raw.documents ?? raw.Documents;
  const pays = raw.paiements ?? raw.Paiements;
  return {
    clientId: Number(raw.clientId ?? raw.ClientId ?? 0),
    clientNom: String(raw.clientNom ?? raw.ClientNom ?? ""),
    accountingYearId: Number(raw.accountingYearId ?? raw.AccountingYearId ?? 0),
    totalFactures: Number(raw.totalFactures ?? raw.TotalFactures ?? 0),
    totalBonsLivraisonNonFactures: Number(raw.totalBonsLivraisonNonFactures ?? raw.TotalBonsLivraisonNonFactures ?? 0),
    totalAvoirs: Number(raw.totalAvoirs ?? raw.TotalAvoirs ?? 0),
    totalFacturesAvoir: Number(raw.totalFacturesAvoir ?? raw.TotalFacturesAvoir ?? 0),
    totalPaiements: Number(raw.totalPaiements ?? raw.TotalPaiements ?? 0),
    solde: Number(raw.solde ?? raw.Solde ?? 0),
    documents: Array.isArray(docs)
      ? (docs as Record<string, unknown>[]).map((d) => ({
          type: String(d.type ?? d.Type ?? ""),
          id: Number(d.id ?? d.Id ?? 0),
          numero: Number(d.numero ?? d.Numero ?? 0),
          date: String(d.date ?? d.Date ?? ""),
          montant: Number(d.montant ?? d.Montant ?? 0),
        }))
      : [],
    paiements: Array.isArray(pays)
      ? (pays as Record<string, unknown>[]).map((p) => {
          const facturesRaw = p.factures ?? p.Factures;
          const factures: FactureRattacheeSolde[] = Array.isArray(facturesRaw)
            ? (facturesRaw as Record<string, unknown>[]).map((f) => ({
                numero: Number(f.numero ?? f.Numero ?? 0),
                montantTtc: Number(f.montantTtc ?? f.MontantTtc ?? 0),
              }))
            : [];
          return {
            id: Number(p.id ?? p.Id ?? 0),
            numeroTransactionBancaire: (p.numeroTransactionBancaire ?? p.NumeroTransactionBancaire) as string | null,
            datePaiement: String(p.datePaiement ?? p.DatePaiement ?? ""),
            montant: Number(p.montant ?? p.Montant ?? 0),
            methodePaiement: String(p.methodePaiement ?? p.MethodePaiement ?? ""),
            numeroChequeTraite: (p.numeroChequeTraite ?? p.NumeroChequeTraite) as string | null,
            banqueNom: (p.banqueNom ?? p.BanqueNom) as string | null,
            dateEcheance:
              (p.dateEcheance ?? p.DateEcheance) != null ? String(p.dateEcheance ?? p.DateEcheance) : null,
            factures,
          };
        })
      : [],
  };
}

export async function getSoldeClient(clientId: number, accountingYearId?: number | null): Promise<SoldeClientResponse> {
  const qs = new URLSearchParams();
  if (accountingYearId != null) qs.set("accountingYearId", String(accountingYearId));
  const suffix = qs.toString();
  const raw = await salesFetchJson<Record<string, unknown>>(`/soldes/client/${clientId}${suffix ? `?${suffix}` : ""}`);
  return normalizeSolde(raw);
}

function normalizePagedClientProblemes(raw: Record<string, unknown>): PagedSoldes<ClientSoldeProblemeRow> {
  const itemsRaw = raw.items ?? raw.Items;
  const list = Array.isArray(itemsRaw)
    ? (itemsRaw as Record<string, unknown>[]).map((r) => ({
        clientId: Number(r.clientId ?? r.ClientId ?? 0),
        clientNom: String(r.clientNom ?? r.ClientNom ?? ""),
        solde: Number(r.solde ?? r.Solde ?? 0),
        nombreQuantitesNonLivrees: Number(r.nombreQuantitesNonLivrees ?? r.NombreQuantitesNonLivrees ?? 0),
        totalFactures: Number(r.totalFactures ?? r.TotalFactures ?? 0),
        totalPaiements: Number(r.totalPaiements ?? r.TotalPaiements ?? 0),
        dateDernierDocument:
          (r.dateDernierDocument ?? r.DateDernierDocument) != null
            ? String(r.dateDernierDocument ?? r.DateDernierDocument)
            : null,
      }))
    : [];
  return {
    currentPage: Number(raw.currentPage ?? raw.CurrentPage ?? 1),
    totalPages: Number(raw.totalPages ?? raw.TotalPages ?? 1),
    pageSize: Number(raw.pageSize ?? raw.PageSize ?? 10),
    totalCount: Number(raw.totalCount ?? raw.TotalCount ?? list.length),
    items: list,
  };
}

export async function getClientsAvecProblemesSolde(params: {
  pageNumber?: number;
  pageSize?: number;
  accountingYearId?: number | null;
}): Promise<PagedSoldes<ClientSoldeProblemeRow>> {
  const qs = new URLSearchParams();
  qs.set("pageNumber", String(params.pageNumber ?? 1));
  qs.set("pageSize", String(params.pageSize ?? 25));
  if (params.accountingYearId != null) qs.set("accountingYearId", String(params.accountingYearId));
  const raw = await salesFetchJson<Record<string, unknown>>(`/soldes/clients-avec-problemes?${qs.toString()}`);
  return normalizePagedClientProblemes(raw);
}

async function downloadBlob(path: string, fallbackFilename: string): Promise<Blob> {
  const res = await salesFetch(path, { method: "GET" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
  const blob = await res.blob();
  (blob as Blob & { __filename?: string }).__filename =
    res.headers.get("content-disposition")?.match(/filename\*=UTF-8''([^;]+)|filename=\"?([^\";]+)\"?/i)?.[1] ??
    res.headers.get("content-disposition")?.match(/filename=\"?([^\";]+)\"?/i)?.[1] ??
    fallbackFilename;
  return blob;
}

export async function exportClientsAvecProblemesSoldePdf(accountingYearId?: number | null): Promise<Blob> {
  const qs = accountingYearId != null ? `?accountingYearId=${accountingYearId}` : "";
  return downloadBlob(`/soldes/clients-avec-problemes/export/pdf${qs}`, `ClientsProblemesSolde_${Date.now()}.pdf`);
}

export async function exportClientsAvecProblemesSoldeExcel(accountingYearId?: number | null): Promise<Blob> {
  const qs = accountingYearId != null ? `?accountingYearId=${accountingYearId}` : "";
  return downloadBlob(`/soldes/clients-avec-problemes/export/excel${qs}`, `ClientsProblemesSolde_${Date.now()}.xlsx`);
}

// --- Supplier (fournisseur) balances ---

export type AvoirRattacheSolde = {
  type: string;
  numero: number;
  libelle?: string | null;
  montant: number;
};

export type DocumentSoldeFournisseur = {
  type: string;
  id: number;
  numero: number;
  date: string;
  montant: number;
  formuleMontant?: string | null;
  avoirsRattaches?: AvoirRattacheSolde[];
};

export type PaiementSoldeFournisseur = {
  id: number;
  numeroTransactionBancaire?: string | null;
  datePaiement: string;
  montant: number;
  methodePaiement: string;
  factures: FactureRattacheeSolde[];
};

export type SoldeFournisseurResponse = {
  fournisseurId: number;
  fournisseurNom: string;
  accountingYearId: number;
  totalFactures: number;
  totalBonsReceptionNonFactures: number;
  totalFacturesAvoir: number;
  totalAvoirsFinanciers: number;
  totalPaiements: number;
  solde: number;
  documents: DocumentSoldeFournisseur[];
  paiements: PaiementSoldeFournisseur[];
};

function normalizeSoldeFournisseur(raw: Record<string, unknown>): SoldeFournisseurResponse {
  const docs = raw.documents ?? raw.Documents;
  const pays = raw.paiements ?? raw.Paiements;
  return {
    fournisseurId: Number(raw.fournisseurId ?? raw.FournisseurId ?? 0),
    fournisseurNom: String(raw.fournisseurNom ?? raw.FournisseurNom ?? ""),
    accountingYearId: Number(raw.accountingYearId ?? raw.AccountingYearId ?? 0),
    totalFactures: Number(raw.totalFactures ?? raw.TotalFactures ?? 0),
    totalBonsReceptionNonFactures: Number(raw.totalBonsReceptionNonFactures ?? raw.TotalBonsReceptionNonFactures ?? 0),
    totalFacturesAvoir: Number(raw.totalFacturesAvoir ?? raw.TotalFacturesAvoir ?? 0),
    totalAvoirsFinanciers: Number(raw.totalAvoirsFinanciers ?? raw.TotalAvoirsFinanciers ?? 0),
    totalPaiements: Number(raw.totalPaiements ?? raw.TotalPaiements ?? 0),
    solde: Number(raw.solde ?? raw.Solde ?? 0),
    documents: Array.isArray(docs)
      ? (docs as Record<string, unknown>[]).map((d) => {
          const ar = d.avoirsRattaches ?? d.AvoirsRattaches;
          const avoirsRattaches: AvoirRattacheSolde[] | undefined = Array.isArray(ar)
            ? (ar as Record<string, unknown>[]).map((a) => ({
                type: String(a.type ?? a.Type ?? ""),
                numero: Number(a.numero ?? a.Numero ?? 0),
                libelle: (a.libelle ?? a.Libelle ?? null) as string | null,
                montant: Number(a.montant ?? a.Montant ?? 0),
              }))
            : undefined;
          return {
            type: String(d.type ?? d.Type ?? ""),
            id: Number(d.id ?? d.Id ?? 0),
            numero: Number(d.numero ?? d.Numero ?? 0),
            date: String(d.date ?? d.Date ?? ""),
            montant: Number(d.montant ?? d.Montant ?? 0),
            formuleMontant: (d.formuleMontant ?? d.FormuleMontant ?? null) as string | null,
            avoirsRattaches,
          };
        })
      : [],
    paiements: Array.isArray(pays)
      ? (pays as Record<string, unknown>[]).map((p) => {
          const facturesRaw = p.factures ?? p.Factures;
          const factures: FactureRattacheeSolde[] = Array.isArray(facturesRaw)
            ? (facturesRaw as Record<string, unknown>[]).map((f) => ({
                numero: Number(f.numero ?? f.Numero ?? 0),
                montantTtc: Number(f.montantTtc ?? f.MontantTtc ?? 0),
              }))
            : [];
          return {
            id: Number(p.id ?? p.Id ?? 0),
            numeroTransactionBancaire: (p.numeroTransactionBancaire ?? p.NumeroTransactionBancaire) as string | null,
            datePaiement: String(p.datePaiement ?? p.DatePaiement ?? ""),
            montant: Number(p.montant ?? p.Montant ?? 0),
            methodePaiement: String(p.methodePaiement ?? p.MethodePaiement ?? ""),
            factures,
          };
        })
      : [],
  };
}

export async function getSoldeFournisseur(fournisseurId: number, accountingYearId?: number | null): Promise<SoldeFournisseurResponse> {
  const qs = new URLSearchParams();
  if (accountingYearId != null) qs.set("accountingYearId", String(accountingYearId));
  const suffix = qs.toString();
  const raw = await salesFetchJson<Record<string, unknown>>(
    `/soldes/fournisseur/${fournisseurId}${suffix ? `?${suffix}` : ""}`
  );
  return normalizeSoldeFournisseur(raw);
}

export type FournisseurSoldeProblemeRow = {
  fournisseurId: number;
  fournisseurNom: string;
  solde: number;
  totalFactures: number;
  totalFacturesAvoir: number;
  totalAvoirsFinanciers: number;
  totalPaiements: number;
  dateDernierDocument: string | null;
};

function normalizePagedFournisseurProblemes(raw: Record<string, unknown>): PagedSoldes<FournisseurSoldeProblemeRow> {
  const itemsRaw = raw.items ?? raw.Items;
  const list = Array.isArray(itemsRaw)
    ? (itemsRaw as Record<string, unknown>[]).map((r) => ({
        fournisseurId: Number(r.fournisseurId ?? r.FournisseurId ?? 0),
        fournisseurNom: String(r.fournisseurNom ?? r.FournisseurNom ?? ""),
        solde: Number(r.solde ?? r.Solde ?? 0),
        totalFactures: Number(r.totalFactures ?? r.TotalFactures ?? 0),
        totalFacturesAvoir: Number(r.totalFacturesAvoir ?? r.TotalFacturesAvoir ?? 0),
        totalAvoirsFinanciers: Number(r.totalAvoirsFinanciers ?? r.TotalAvoirsFinanciers ?? 0),
        totalPaiements: Number(r.totalPaiements ?? r.TotalPaiements ?? 0),
        dateDernierDocument:
          (r.dateDernierDocument ?? r.DateDernierDocument) != null
            ? String(r.dateDernierDocument ?? r.DateDernierDocument)
            : null,
      }))
    : [];
  return {
    currentPage: Number(raw.currentPage ?? raw.CurrentPage ?? 1),
    totalPages: Number(raw.totalPages ?? raw.TotalPages ?? 1),
    pageSize: Number(raw.pageSize ?? raw.PageSize ?? 10),
    totalCount: Number(raw.totalCount ?? raw.TotalCount ?? list.length),
    items: list,
  };
}

export async function getFournisseursAvecProblemesSolde(params: {
  pageNumber?: number;
  pageSize?: number;
  accountingYearId?: number | null;
}): Promise<PagedSoldes<FournisseurSoldeProblemeRow>> {
  const qs = new URLSearchParams();
  qs.set("pageNumber", String(params.pageNumber ?? 1));
  qs.set("pageSize", String(params.pageSize ?? 25));
  if (params.accountingYearId != null) qs.set("accountingYearId", String(params.accountingYearId));
  const raw = await salesFetchJson<Record<string, unknown>>(`/soldes/fournisseurs-avec-problemes?${qs.toString()}`);
  return normalizePagedFournisseurProblemes(raw);
}

// --- Operating expenses (tiers dépense) balances ---

export type FactureDepenseRattacheeSolde = {
  numero: number;
  montantTtc: number;
};

export type DocumentSoldeTiersDepense = {
  type: string;
  id: number;
  numero: number;
  date: string;
  montant: number;
  description?: string | null;
};

export type PaiementSoldeTiersDepense = {
  id: number;
  numeroTransactionBancaire?: string | null;
  datePaiement: string;
  montant: number;
  methodePaiement: string;
  factures: FactureDepenseRattacheeSolde[];
};

export type SoldeTiersDepenseResponse = {
  tiersDepenseFonctionnementId: number;
  tiersDepenseFonctionnementNom: string;
  accountingYearId: number;
  totalFacturesDepense: number;
  totalPaiements: number;
  solde: number;
  documents: DocumentSoldeTiersDepense[];
  paiements: PaiementSoldeTiersDepense[];
};

function normalizeSoldeTiersDepense(raw: Record<string, unknown>): SoldeTiersDepenseResponse {
  const docs = raw.documents ?? raw.Documents;
  const pays = raw.paiements ?? raw.Paiements;
  return {
    tiersDepenseFonctionnementId: Number(raw.tiersDepenseFonctionnementId ?? raw.TiersDepenseFonctionnementId ?? 0),
    tiersDepenseFonctionnementNom: String(raw.tiersDepenseFonctionnementNom ?? raw.TiersDepenseFonctionnementNom ?? ""),
    accountingYearId: Number(raw.accountingYearId ?? raw.AccountingYearId ?? 0),
    totalFacturesDepense: Number(raw.totalFacturesDepense ?? raw.TotalFacturesDepense ?? 0),
    totalPaiements: Number(raw.totalPaiements ?? raw.TotalPaiements ?? 0),
    solde: Number(raw.solde ?? raw.Solde ?? 0),
    documents: Array.isArray(docs)
      ? (docs as Record<string, unknown>[]).map((d) => ({
          type: String(d.type ?? d.Type ?? ""),
          id: Number(d.id ?? d.Id ?? 0),
          numero: Number(d.numero ?? d.Numero ?? 0),
          date: String(d.date ?? d.Date ?? ""),
          montant: Number(d.montant ?? d.Montant ?? 0),
          description: (d.description ?? d.Description ?? null) as string | null,
        }))
      : [],
    paiements: Array.isArray(pays)
      ? (pays as Record<string, unknown>[]).map((p) => {
          const facturesRaw = p.factures ?? p.Factures;
          const factures: FactureDepenseRattacheeSolde[] = Array.isArray(facturesRaw)
            ? (facturesRaw as Record<string, unknown>[]).map((f) => ({
                numero: Number(f.numero ?? f.Numero ?? 0),
                montantTtc: Number(f.montantTtc ?? f.MontantTtc ?? 0),
              }))
            : [];
          return {
            id: Number(p.id ?? p.Id ?? 0),
            numeroTransactionBancaire: (p.numeroTransactionBancaire ?? p.NumeroTransactionBancaire ?? null) as string | null,
            datePaiement: String(p.datePaiement ?? p.DatePaiement ?? ""),
            montant: Number(p.montant ?? p.Montant ?? 0),
            methodePaiement: String(p.methodePaiement ?? p.MethodePaiement ?? ""),
            factures,
          };
        })
      : [],
  };
}

export async function getSoldeTiersDepense(
  tiersDepenseFonctionnementId: number,
  accountingYearId?: number | null
): Promise<SoldeTiersDepenseResponse> {
  const qs = new URLSearchParams();
  if (accountingYearId != null) qs.set("accountingYearId", String(accountingYearId));
  const suffix = qs.toString();
  const raw = await salesFetchJson<Record<string, unknown>>(
    `/soldes/tiers-depenses/${tiersDepenseFonctionnementId}${suffix ? `?${suffix}` : ""}`
  );
  return normalizeSoldeTiersDepense(raw);
}
