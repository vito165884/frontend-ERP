
import { salesFetch, salesFetchJson } from "@/lib/http";

export type PagedList<T> = {
  items: T[];
  totalCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

export type CreditNoteBaseInfo = {
  num: number;
  date: string; // DateTimeOffset serialized
  clientId?: number | null;
  clientName?: string | null;
  totalExcludingTaxAmount: number;
  totalVATAmount: number;
  totalIncludingTaxAmount: number;
  statut: number;
  statutLibelle?: string | null;
};

export type GetCreditNotesWithSummariesResponse = {
  totalNetAmount: number;
  totalVatAmount: number;
  totalIncludingTaxAmount: number;
  avoirs: PagedList<CreditNoteBaseInfo>;
};

export async function getCreditNotesWithSummaries(params: {
  pageNumber: number;
  pageSize: number;
  clientId?: number | null;
  sortOrder?: string | null;
  sortProperty?: string | null;
  searchKeyword?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
  status?: number | null;
}): Promise<GetCreditNotesWithSummariesResponse> {
  const qs = new URLSearchParams();
  qs.set("pageNumber", String(params.pageNumber));
  qs.set("pageSize", String(params.pageSize));
  if (params.clientId) qs.set("clientId", String(params.clientId));
  if (params.sortOrder) qs.set("sortOrder", params.sortOrder);
  if (params.sortProperty) qs.set("sortProperty", params.sortProperty);
  if (params.searchKeyword) qs.set("searchKeyword", params.searchKeyword);
  if (params.status !== undefined && params.status !== null) qs.set("status", String(params.status));

  const toApiDateTime = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
      d.getMinutes()
    )}:${pad(d.getSeconds())}`;
  };
  if (params.startDate) qs.set("startDate", toApiDateTime(params.startDate));
  if (params.endDate) qs.set("endDate", toApiDateTime(params.endDate));

  return await salesFetchJson<GetCreditNotesWithSummariesResponse>(`/avoirs/summaries?${qs.toString()}`);
}

export async function validateCreditNotes(ids: number[]): Promise<void> {
  const res = await salesFetch(`/api/avoirs/validate`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(ids),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
}

export type CreditNoteLineRequest = {
  refProduit: string;
  designationLi?: string | null;
  qteLi: number;
  prixHt: number;
  remise: number;
  tva: number;
};

export type CreateCreditNoteRequest = {
  date: string; // ISO
  clientId?: number | null;
  lines: CreditNoteLineRequest[];
};

export type UpdateCreditNoteRequest = CreateCreditNoteRequest;

export type CreditNoteResponse = {
  num: number;
  date: string;
  clientId?: number | null;
  totalExcludingTaxAmount: number;
  totalVATAmount: number;
  totalIncludingTaxAmount: number;
  statut: number;
  statutLibelle?: string | null;
};

export async function getCreditNote(num: number): Promise<CreditNoteResponse> {
  return await salesFetchJson<CreditNoteResponse>(`/avoirs/${num}`);
}

export async function createCreditNote(request: { date: string; clientId: number | null; lines: CreditNoteLineRequest[] }): Promise<number> {
  const res = await salesFetch(`/avoirs`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
  const location = res.headers.get("location") ?? "";
  const last = location.split("/").filter(Boolean).at(-1);
  const n = last ? Number(last) : NaN;
  if (!Number.isFinite(n)) throw new Error("Create succeeded but could not read created credit note number");
  return n;
}

export async function updateCreditNote(num: number, request: UpdateCreditNoteRequest): Promise<void> {
  const res = await salesFetch(`/avoirs/${num}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
}

