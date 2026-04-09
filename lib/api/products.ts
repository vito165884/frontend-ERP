import { salesFetch, salesFetchJson } from "@/lib/http";
import type { PagedList } from "@/lib/api/customers";

export type Product = {
  id: number;
  reference: string;
  name: string;
  qteLimit: number;
  discountPourcentage: number;
  discountPourcentageOfPurchasing: number;
  vatRate: number;
  price: number;
  purchasingPrice: number;
  visibility: boolean;
  stockCalcule?: number | null;
  stockDisponible?: number | null;
  isStockLow: boolean;
  qteEnRetourFournisseur?: number | null;
  qteEnReparation?: number | null;
  stockReel?: number | null;
  sousFamilleProduitId?: number | null;
  sousFamilleProduitNom?: string | null;
  image1StoragePath?: string | null;
  image2StoragePath?: string | null;
  image3StoragePath?: string | null;
};

function normalizeProduct(raw: unknown): Product {
  const r = raw as Record<string, unknown>;
  return {
    id: Number(r.id ?? r.Id ?? 0),
    reference: String(r.reference ?? r.Reference ?? ""),
    name: String(r.name ?? r.Name ?? ""),
    qteLimit: Number(r.qteLimit ?? r.QteLimit ?? 0),
    discountPourcentage: Number(r.discountPourcentage ?? r.DiscountPourcentage ?? 0),
    discountPourcentageOfPurchasing: Number(
      r.discountPourcentageOfPurchasing ?? r.DiscountPourcentageOfPurchasing ?? 0
    ),
    vatRate: Number(r.vatRate ?? r.VatRate ?? 0),
    price: Number(r.price ?? r.Price ?? 0),
    purchasingPrice: Number(r.purchasingPrice ?? r.PurchasingPrice ?? 0),
    visibility: Boolean(r.visibility ?? r.Visibility ?? false),
    stockCalcule: (r.stockCalcule ?? r.StockCalcule ?? null) as number | null,
    stockDisponible: (r.stockDisponible ?? r.StockDisponible ?? null) as number | null,
    isStockLow: Boolean(r.isStockLow ?? r.IsStockLow ?? false),
    qteEnRetourFournisseur: (r.qteEnRetourFournisseur ?? r.QteEnRetourFournisseur ?? null) as number | null,
    qteEnReparation: (r.qteEnReparation ?? r.QteEnReparation ?? null) as number | null,
    stockReel: (r.stockReel ?? r.StockReel ?? null) as number | null,
    sousFamilleProduitId: (r.sousFamilleProduitId ?? r.SousFamilleProduitId ?? null) as number | null,
    sousFamilleProduitNom: (r.sousFamilleProduitNom ?? r.SousFamilleProduitNom ?? null) as string | null,
    image1StoragePath: (r.image1StoragePath ?? r.Image1StoragePath ?? null) as string | null,
    image2StoragePath: (r.image2StoragePath ?? r.Image2StoragePath ?? null) as string | null,
    image3StoragePath: (r.image3StoragePath ?? r.Image3StoragePath ?? null) as string | null,
  };
}

function normalizePaged(raw: unknown): PagedList<Product> {
  const r = raw as Record<string, unknown>;
  const itemsRaw = (r.items ?? r.Items ?? []) as unknown;
  return {
    items: Array.isArray(itemsRaw) ? itemsRaw.map(normalizeProduct) : [],
    totalCount: Number(r.totalCount ?? r.TotalCount ?? 0),
    pageSize: Number(r.pageSize ?? r.PageSize ?? 0),
    currentPage: Number(r.currentPage ?? r.CurrentPage ?? 0),
    totalPages: Number(r.totalPages ?? r.TotalPages ?? 0),
    hasNext: Boolean(r.hasNext ?? r.HasNext ?? false),
    hasPrevious: Boolean(r.hasPrevious ?? r.HasPrevious ?? false),
  };
}

export async function getProducts(params?: {
  pageNumber?: number;
  pageSize?: number;
  searchKeyword?: string | null;
  sortProprety?: string | null;
  sortOrder?: string | null;
  familleProduitId?: number | null;
  sousFamilleProduitId?: number | null;
  visibility?: boolean | null;
  stockLowOnly?: boolean | null;
  stockCalculeMin?: number | null;
  stockCalculeMax?: number | null;
}): Promise<PagedList<Product>> {
  const qs = new URLSearchParams();
  qs.set("pageNumber", String(params?.pageNumber ?? 1));
  qs.set("pageSize", String(Math.min(params?.pageSize ?? 50, 50)));
  if (params?.searchKeyword) qs.set("searchKeyword", params.searchKeyword);
  if (params?.sortProprety) qs.set("sortProprety", params.sortProprety);
  if (params?.sortOrder) qs.set("sortOrder", params.sortOrder);
  if (params?.familleProduitId != null) qs.set("familleProduitId", String(params.familleProduitId));
  if (params?.sousFamilleProduitId != null) qs.set("sousFamilleProduitId", String(params.sousFamilleProduitId));
  if (params?.visibility != null) qs.set("visibility", String(params.visibility));
  if (params?.stockLowOnly != null) qs.set("stockLowOnly", String(params.stockLowOnly));
  if (params?.stockCalculeMin != null) qs.set("stockCalculeMin", String(params.stockCalculeMin));
  if (params?.stockCalculeMax != null) qs.set("stockCalculeMax", String(params.stockCalculeMax));

  const raw = await salesFetchJson<unknown>(`/products?${qs.toString()}`);
  return normalizePaged(raw);
}

export async function deleteProductByReference(refe: string): Promise<void> {
  const res = await salesFetch(`/products/${encodeURIComponent(refe)}`, { method: "DELETE" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
}

export async function getProductByRef(refe: string): Promise<Product> {
  const raw = await salesFetchJson<unknown>(`/products/by-ref/${encodeURIComponent(refe)}`);
  return normalizeProduct(raw);
}

