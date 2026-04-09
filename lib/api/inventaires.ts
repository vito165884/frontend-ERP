import { salesFetch, salesFetchJson } from "@/lib/http";
import type { PagedList } from "@/lib/api/customers";

export type Inventaire = {
  id: number;
  num: number;
  accountingYearId: number;
  accountingYear: number;
  dateInventaire: string;
  description?: string | null;
  statut: number;
  statutLibelle: string;
  totalHt: number;
};

function normalizeInventaire(raw: unknown): Inventaire {
  const r = raw as Record<string, unknown>;
  return {
    id: Number(r.id ?? r.Id ?? 0),
    num: Number(r.num ?? r.Num ?? 0),
    accountingYearId: Number(r.accountingYearId ?? r.AccountingYearId ?? 0),
    accountingYear: Number(r.accountingYear ?? r.AccountingYear ?? 0),
    dateInventaire: String(r.dateInventaire ?? r.DateInventaire ?? ""),
    description: (r.description ?? r.Description ?? null) as string | null,
    statut: Number(r.statut ?? r.Statut ?? 0),
    statutLibelle: String(r.statutLibelle ?? r.StatutLibelle ?? ""),
    totalHt: Number(r.totalHt ?? r.TotalHt ?? 0),
  };
}

function normalizePaged(raw: unknown): PagedList<Inventaire> {
  const r = raw as Record<string, unknown>;
  const itemsRaw = (r.items ?? r.Items ?? []) as unknown;
  return {
    items: Array.isArray(itemsRaw) ? itemsRaw.map(normalizeInventaire) : [],
    totalCount: Number(r.totalCount ?? r.TotalCount ?? 0),
    pageSize: Number(r.pageSize ?? r.PageSize ?? 0),
    currentPage: Number(r.currentPage ?? r.CurrentPage ?? 0),
    totalPages: Number(r.totalPages ?? r.TotalPages ?? 0),
    hasNext: Boolean(r.hasNext ?? r.HasNext ?? false),
    hasPrevious: Boolean(r.hasPrevious ?? r.HasPrevious ?? false),
  };
}

export async function getInventaires(params?: {
  pageNumber?: number;
  pageSize?: number;
  searchKeyword?: string | null;
  sortProperty?: string | null;
  sortOrder?: string | null;
  accountingYearId?: number | null;
}): Promise<PagedList<Inventaire>> {
  const qs = new URLSearchParams();
  qs.set("pageNumber", String(params?.pageNumber ?? 1));
  qs.set("pageSize", String(Math.min(params?.pageSize ?? 50, 50)));
  if (params?.searchKeyword) qs.set("searchKeyword", params.searchKeyword);
  if (params?.sortProperty) qs.set("sortProperty", params.sortProperty);
  if (params?.sortOrder) qs.set("sortOrder", params.sortOrder);
  if (params?.accountingYearId != null) qs.set("accountingYearId", String(params.accountingYearId));
  const raw = await salesFetchJson<unknown>(`/inventaires?${qs.toString()}`);
  return normalizePaged(raw);
}

export async function exportInventairesLignesExcel(inventaireIds: number[]): Promise<Blob> {
  const res = await salesFetch(`/inventaires/export/lignes/excel`, {
    method: "POST",
    body: JSON.stringify({ inventaireIds }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
  const blob = await res.blob();
  (blob as any).__filename =
    res.headers.get("content-disposition")?.match(/filename\*=UTF-8''([^;]+)|filename=\"?([^\";]+)\"?/i)?.[1] ??
    res.headers.get("content-disposition")?.match(/filename=\"?([^\";]+)\"?/i)?.[1] ??
    `Inventaires_Lignes.xlsx`;
  return blob;
}

export async function createInventaire(body: {
  accountingYearId: number;
  dateInventaire: string;
  description?: string | null;
  lignes: { refProduit: string; quantiteReelle: number; prixHt: number; dernierPrixAchat: number }[];
}): Promise<{ id?: number } | null> {
  const res = await salesFetch(`/inventaires`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
  // Endpoint returns Created(..., request) so body may just echo input; id is in Location header.
  const loc = res.headers.get("location") ?? res.headers.get("Location") ?? "";
  const id = loc.match(/\/inventaires\/(\d+)/i)?.[1];
  return id ? { id: Number(id) } : null;
}

