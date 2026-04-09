import { salesFetch, salesFetchJson } from "@/lib/http";

export type QuotationItem = {
  id: number;
  productReference: string;
  description: string;
  quantity: number;
  unitPriceExcludingTax: number;
  discountPercentage: number;
  totalExcludingTax: number;
  vatPercentage: number;
  totalIncludingTax: number;
};

export type FullQuotation = {
  num: number;
  date: string; // ISO
  customerId: number;
  totalExcludingTax: number;
  totalVat: number;
  totalAmount: number;
  statut: number;
  statutLibelle: string;
  items: QuotationItem[];
};

export type CreateQuotationRequest = {
  idClient: number;
  date: string; // ISO
  totHTva: number;
  TotTva: number;
  TotTtc: number;
  items: QuotationItem[];
};

export type UpdateQuotationRequest = CreateQuotationRequest & {
  num: number;
};

function parseCreatedNumberFromLocation(location: string | null): number | null {
  if (!location) return null;
  const last = location.split("/").filter(Boolean).at(-1);
  const n = last ? Number(last) : NaN;
  return Number.isFinite(n) ? n : null;
}

export async function getQuotationByNum(num: number): Promise<FullQuotation> {
  return await salesFetchJson<FullQuotation>(`/quotations/${num}`);
}

export async function createQuotation(request: CreateQuotationRequest): Promise<number> {
  const res = await salesFetch("/quotations", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }

  const created = parseCreatedNumberFromLocation(res.headers.get("location"));
  if (!created) throw new Error("Create succeeded but could not read created quotation number");
  return created;
}

export async function updateQuotation(num: number, request: UpdateQuotationRequest): Promise<void> {
  const res = await salesFetch(`/quotations/${num}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
}

export async function validateQuotations(ids: number[]): Promise<void> {
  if (!ids.length) return;
  await salesFetchJson("/api/quotations/validate", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ids }),
  });
}

export async function validateQuotation(num: number): Promise<void> {
  await validateQuotations([num]);
}

/** Clone quotation lines into a new draft (same behavior as Razor `DuplicateQuotation`). */
export async function duplicateQuotation(num: number): Promise<number> {
  const full = await getQuotationByNum(num);
  const today = new Date();
  const dateIso = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0).toISOString();
  return createQuotation({
    idClient: full.customerId,
    date: dateIso,
    totHTva: full.totalExcludingTax,
    TotTva: full.totalVat,
    TotTtc: full.totalAmount,
    items: (full.items ?? []).map((o) => ({
      id: 0,
      productReference: o.productReference,
      description: o.description,
      quantity: o.quantity,
      unitPriceExcludingTax: o.unitPriceExcludingTax,
      discountPercentage: o.discountPercentage,
      totalExcludingTax: o.totalExcludingTax,
      vatPercentage: o.vatPercentage,
      totalIncludingTax: o.totalIncludingTax,
    })),
  });
}

