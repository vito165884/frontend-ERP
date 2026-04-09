import { salesFetch, salesFetchJson } from "@/lib/http";
import type { PagedList } from "@/lib/api/customers";

export type TiersDepenseFonctionnement = {
  id: number;
  nom: string;
  tel?: string | null;
  adresse?: string | null;
  matricule?: string | null;
  code?: string | null;
  codeCat?: string | null;
  etbSec?: string | null;
  mail?: string | null;
  exonereRetenueSource?: boolean;
};

function normalizeTiers(raw: unknown): TiersDepenseFonctionnement {
  const r = raw as Record<string, unknown>;
  return {
    id: Number(r.id ?? r.Id ?? 0),
    nom: String(r.nom ?? r.Nom ?? ""),
    tel: (r.tel ?? r.Tel ?? null) as string | null,
    adresse: (r.adresse ?? r.Adresse ?? null) as string | null,
    matricule: (r.matricule ?? r.Matricule ?? null) as string | null,
    code: (r.code ?? r.Code ?? null) as string | null,
    codeCat: (r.codeCat ?? r.CodeCat ?? r.CodeCat ?? null) as string | null,
    etbSec: (r.etbSec ?? r.EtbSec ?? null) as string | null,
    mail: (r.mail ?? r.Mail ?? null) as string | null,
    exonereRetenueSource: Boolean(r.exonereRetenueSource ?? r.ExonereRetenueSource ?? false),
  };
}

function normalizePaged(raw: unknown): PagedList<TiersDepenseFonctionnement> {
  const r = raw as Record<string, unknown>;
  const itemsRaw = (r.items ?? r.Items ?? []) as unknown;
  return {
    items: Array.isArray(itemsRaw) ? itemsRaw.map(normalizeTiers) : [],
    totalCount: Number(r.totalCount ?? r.TotalCount ?? 0),
    pageSize: Number(r.pageSize ?? r.PageSize ?? 0),
    currentPage: Number(r.currentPage ?? r.CurrentPage ?? 0),
    totalPages: Number(r.totalPages ?? r.TotalPages ?? 0),
    hasNext: Boolean(r.hasNext ?? r.HasNext ?? false),
    hasPrevious: Boolean(r.hasPrevious ?? r.HasPrevious ?? false),
  };
}

export async function getTiersDepensesFonctionnement(params?: {
  pageNumber?: number;
  pageSize?: number;
  searchKeyword?: string | null;
}): Promise<PagedList<TiersDepenseFonctionnement>> {
  const qs = new URLSearchParams();
  qs.set("pageNumber", String(params?.pageNumber ?? 1));
  qs.set("pageSize", String(Math.min(params?.pageSize ?? 50, 50)));
  if (params?.searchKeyword) qs.set("searchKeyword", params.searchKeyword);
  const raw = await salesFetchJson<unknown>(`/tiers-depenses-fonctionnement?${qs.toString()}`);
  return normalizePaged(raw);
}

export async function getTiersDepenseFonctionnement(id: number): Promise<TiersDepenseFonctionnement> {
  const raw = await salesFetchJson<unknown>(`/tiers-depenses-fonctionnement/${id}`);
  return normalizeTiers(raw);
}

export async function createTiersDepenseFonctionnement(body: Record<string, unknown>): Promise<TiersDepenseFonctionnement> {
  const raw = await salesFetchJson<unknown>(`/tiers-depenses-fonctionnement`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return normalizeTiers(raw);
}

export async function updateTiersDepenseFonctionnement(
  id: number,
  body: Record<string, unknown>
): Promise<TiersDepenseFonctionnement> {
  const raw = await salesFetchJson<unknown>(`/tiers-depenses-fonctionnement/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
  return normalizeTiers(raw);
}

export async function deleteTiersDepenseFonctionnement(id: number): Promise<void> {
  const res = await salesFetch(`/tiers-depenses-fonctionnement/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
}

