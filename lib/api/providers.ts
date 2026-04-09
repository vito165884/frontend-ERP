import { salesFetch, salesFetchJson } from "@/lib/http";
import type { PagedList } from "@/lib/api/customers";

export type Provider = {
  id: number;
  nom: string;
  tel: string;
  fax?: string | null;
  matricule?: string | null;
  code?: string | null;
  codecat?: string | null;
  etbsec?: string | null;
  mail?: string | null;
  maildeux?: string | null;
  constructeur: boolean;
  adresse?: string | null;
  tauxRetenu?: number | null;
  exonereRetenueSource: boolean;
  ribCodeEtab?: string | null;
  ribCodeAgence?: string | null;
  ribNumeroCompte?: string | null;
  ribCle?: string | null;
};

function normalizeProvider(raw: Record<string, unknown>): Provider {
  return {
    id: Number(raw.id ?? raw.Id ?? 0),
    nom: String(raw.nom ?? raw.Nom ?? ""),
    tel: String(raw.tel ?? raw.Tel ?? ""),
    fax: (raw.fax ?? raw.Fax) as string | null,
    matricule: (raw.matricule ?? raw.Matricule) as string | null,
    code: (raw.code ?? raw.Code) as string | null,
    codecat: (raw.codecat ?? raw.codeCat ?? raw.CodeCat) as string | null,
    etbsec: (raw.etbsec ?? raw.etbSec ?? raw.EtbSec) as string | null,
    mail: (raw.mail ?? raw.Mail) as string | null,
    maildeux: (raw.maildeux ?? raw.mailDeux ?? raw.MailDeux) as string | null,
    constructeur: Boolean(raw.constructeur ?? raw.Constructeur ?? false),
    adresse: (raw.adresse ?? raw.Adresse) as string | null,
    tauxRetenu: (raw.tauxRetenu ?? raw.TauxRetenu) != null ? Number(raw.tauxRetenu ?? raw.TauxRetenu) : null,
    exonereRetenueSource: Boolean(raw.exonereRetenueSource ?? raw.ExonereRetenueSource ?? false),
    ribCodeEtab: (raw.ribCodeEtab ?? raw.RibCodeEtab) as string | null,
    ribCodeAgence: (raw.ribCodeAgence ?? raw.RibCodeAgence) as string | null,
    ribNumeroCompte: (raw.ribNumeroCompte ?? raw.RibNumeroCompte) as string | null,
    ribCle: (raw.ribCle ?? raw.RibCle) as string | null,
  };
}

export async function getProviders(params: {
  pageNumber: number;
  pageSize: number;
  searchKeyword?: string | null;
}): Promise<PagedList<Provider>> {
  const qs = new URLSearchParams();
  qs.set("pageNumber", String(params.pageNumber));
  qs.set("pageSize", String(Math.min(params.pageSize, 50)));
  if (params.searchKeyword?.trim()) qs.set("searchKeyword", params.searchKeyword.trim());

  const raw = await salesFetchJson<Record<string, unknown>>(`/providers?${qs.toString()}`);
  const itemsRaw = raw.items ?? raw.Items;
  const items = Array.isArray(itemsRaw)
    ? (itemsRaw as Record<string, unknown>[]).map(normalizeProvider)
    : [];

  return {
    items,
    totalCount: Number(raw.totalCount ?? raw.TotalCount ?? items.length),
    pageSize: Number(raw.pageSize ?? raw.PageSize ?? params.pageSize),
    currentPage: Number(raw.currentPage ?? raw.CurrentPage ?? params.pageNumber),
    totalPages: Number(raw.totalPages ?? raw.TotalPages ?? 1),
    hasNext: Boolean(raw.hasNext ?? raw.HasNext ?? false),
    hasPrevious: Boolean(raw.hasPrevious ?? raw.HasPrevious ?? false),
  };
}

export async function getProviderById(id: number): Promise<Provider> {
  const raw = await salesFetchJson<Record<string, unknown>>(`/providers/${id}`);
  return normalizeProvider(raw);
}

export type CreateProviderRequest = {
  nom: string;
  tel: string;
  fax?: string | null;
  matricule?: string | null;
  code?: string | null;
  codeCat?: string | null;
  etbSec?: string | null;
  mail?: string | null;
  mailDeux?: string | null;
  constructeur?: boolean;
  adresse?: string | null;
  tauxRetenu?: number | null;
  exonereRetenueSource?: boolean;
  ribCodeEtab?: string | null;
  ribCodeAgence?: string | null;
  ribNumeroCompte?: string | null;
  ribCle?: string | null;
};

export async function createProvider(request: CreateProviderRequest): Promise<number> {
  const res = await salesFetch("/providers", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
  const loc = res.headers.get("location") ?? "";
  const last = loc.split("/").filter(Boolean).at(-1);
  const n = last ? Number(last) : NaN;
  if (!Number.isFinite(n)) throw new Error("Create succeeded but could not read provider id");
  return n;
}

export type UpdateProviderRequest = CreateProviderRequest;

export async function updateProvider(id: number, request: UpdateProviderRequest): Promise<void> {
  const res = await salesFetch(`/providers/${id}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
}

export async function deleteProvider(id: number): Promise<void> {
  const res = await salesFetch(`/providers/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
}
