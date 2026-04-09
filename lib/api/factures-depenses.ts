import { salesFetch, salesFetchJson } from "@/lib/http";

export type FactureDepenseSummaryItem = {
  id: number;
  numero: number;
  accountingYearId?: number | null;
  accountingYear?: number | null;
  tiersDepenseFonctionnementId?: number | null;
  tiersDepenseFonctionnementNom?: string | null;
  date?: string | null;
  totalHt?: number | null;
  totalTva?: number | null;
  totalTtc?: number | null;
  statut?: number | null;
  statutLibelle?: string | null;
};

export type PagedFacturesDepenses = {
  items: FactureDepenseSummaryItem[];
  totalCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

export type FactureDepenseTotalsResponse = {
  totalHt: number;
  totalTva: number;
  totalTtc: number;
};

function n(r: Record<string, unknown>, key: string): number {
  const v = r[key];
  return Number(v ?? 0);
}

function s(r: Record<string, unknown>, key: string): string | null {
  const v = r[key];
  return v == null ? null : String(v);
}

function normalizeRow(raw: unknown): FactureDepenseSummaryItem {
  const r = raw as Record<string, unknown>;
  return {
    id: Number(r.id ?? r.Id ?? 0),
    numero: Number(r.numero ?? r.Numero ?? 0),
    accountingYearId: (r.accountingYearId ?? r.AccountingYearId ?? null) as number | null,
    accountingYear: (r.accountingYear ?? r.AccountingYear ?? null) as number | null,
    tiersDepenseFonctionnementId: (r.tiersDepenseFonctionnementId ?? r.TiersDepenseFonctionnementId ?? null) as number | null,
    tiersDepenseFonctionnementNom: (r.tiersDepenseFonctionnementNom ?? r.TiersDepenseFonctionnementNom ?? null) as string | null,
    date: s(r, "date") ?? s(r, "Date"),
    totalHt: (r.totalHt ?? r.TotalHt ?? null) as number | null,
    totalTva: (r.totalTva ?? r.TotalTva ?? null) as number | null,
    totalTtc: (r.totalTtc ?? r.TotalTtc ?? null) as number | null,
    statut: (r.statut ?? r.Statut ?? null) as number | null,
    statutLibelle: (r.statutLibelle ?? r.StatutLibelle ?? null) as string | null,
  };
}

function normalizePaged(raw: unknown): PagedFacturesDepenses {
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

async function downloadFromEndpoint(pathWithQuery: string, fallbackFilename: string): Promise<Blob> {
  const res = await salesFetch(pathWithQuery, { method: "GET" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
  const blob = await res.blob();
  (blob as any).__filename =
    res.headers.get("content-disposition")?.match(/filename\*=UTF-8''([^;]+)|filename=\"?([^\";]+)\"?/i)?.[1] ??
    res.headers.get("content-disposition")?.match(/filename=\"?([^\";]+)\"?/i)?.[1] ??
    fallbackFilename;
  return blob;
}

export async function getFacturesDepenses(params?: {
  pageNumber?: number;
  pageSize?: number;
  tiersDepenseFonctionnementId?: number | null;
  accountingYearId?: number | null;
  searchKeyword?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}): Promise<PagedFacturesDepenses> {
  const qs = new URLSearchParams();
  qs.set("pageNumber", String(params?.pageNumber ?? 1));
  qs.set("pageSize", String(Math.min(params?.pageSize ?? 50, 50)));
  if (params?.tiersDepenseFonctionnementId != null) qs.set("tiersDepenseFonctionnementId", String(params.tiersDepenseFonctionnementId));
  if (params?.accountingYearId != null) qs.set("accountingYearId", String(params.accountingYearId));
  if (params?.searchKeyword) qs.set("searchKeyword", params.searchKeyword);
  if (params?.startDate) qs.set("startDate", params.startDate);
  if (params?.endDate) qs.set("endDate", params.endDate);
  const raw = await salesFetchJson<unknown>(`/factures-depenses?${qs.toString()}`);
  return normalizePaged(raw);
}

export async function getFacturesDepensesTotals(params?: {
  accountingYearId?: number | null;
  tiersDepenseFonctionnementId?: number | null;
  startDate?: string | null;
  endDate?: string | null;
}): Promise<FactureDepenseTotalsResponse> {
  const qs = new URLSearchParams();
  if (params?.accountingYearId != null) qs.set("accountingYearId", String(params.accountingYearId));
  if (params?.tiersDepenseFonctionnementId != null) qs.set("tiersDepenseFonctionnementId", String(params.tiersDepenseFonctionnementId));
  if (params?.startDate) qs.set("startDate", params.startDate);
  if (params?.endDate) qs.set("endDate", params.endDate);
  const raw = await salesFetchJson<Record<string, unknown>>(`/api/factures-depenses/totals?${qs.toString()}`);
  return {
    totalHt: n(raw, "totalHt") || n(raw, "TotalHt"),
    totalTva: n(raw, "totalTva") || n(raw, "TotalTva"),
    totalTtc: n(raw, "totalTtc") || n(raw, "TotalTtc"),
  };
}

export async function validateFactureDepense(id: number): Promise<void> {
  const res = await salesFetch(`/factures-depenses/${id}/validate`, { method: "POST" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
}

export async function deleteFactureDepense(id: number): Promise<void> {
  const res = await salesFetch(`/factures-depenses/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
}

export async function exportFactureDepenseTejXml(id: number): Promise<Blob> {
  return await downloadFromEndpoint(`/api/factures-depenses/${id}/export/tej-xml`, `facture-depense-${id}.xml`);
}

