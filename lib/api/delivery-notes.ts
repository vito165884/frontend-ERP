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

export type DeliveryNoteItem = {
  id: number;
  productReference: string;
  description: string;
  quantity: number;
  deliveredQuantity?: number | null;
  unitPriceExcludingTax: number;
  discountPercentage: number;
  totalExcludingTax: number;
  vatPercentage: number;
  totalIncludingTax: number;
};

export type DeliveryNote = {
  id: number;
  deliveryNoteNumber: number;
  date: string; // ISO
  creationTime: string; // TimeOnly serialized
  customerId?: number | null;
  installationTechnicianId?: number | null;
  installationTechnicianName?: string | null;
  deliveryCarId?: number | null;
  invoiceNumber?: number | null;
  totalExcludingTax: number;
  totalVat: number;
  totalAmount: number;
  statut: number; // 0 draft, 1 validated
  statutLibelle: string;
  items: DeliveryNoteItem[];
};

export type DeliveryNoteBaseInfo = {
  id: number;
  number: number;
  date: string; // DateTimeOffset serialized
  numFacture?: number | null;
  netAmount: number;
  grossAmount: number;
  vatAmount: number;
  customerId?: number | null;
  customerName?: string | null;
  statut: number;
  statutLibelle: string;
};

export type DeliveryNotesSummariesResponse = {
  totalNetAmount: number;
  totalGrossAmount: number;
  totalVatAmount: number;
  getDeliveryNoteBaseInfos: PagedList<DeliveryNoteBaseInfo>;
};

export type CreateOrUpdateDeliveryNoteRequest = {
  date: string; // ISO date
  totalExcludingTax: number;
  totalVat: number;
  totalAmount: number;
  deliveryTime: string; // TimeOnly string
  invoiceNumber?: number | null;
  customerId?: number | null;
  installationTechnicianId?: number | null;
  deliveryCarId?: number | null;
  items: DeliveryNoteItem[];
};

function parseCreatedNumberFromLocation(location: string | null): number | null {
  if (!location) return null;
  const last = location.split("/").filter(Boolean).at(-1);
  const n = last ? Number(last) : NaN;
  return Number.isFinite(n) ? n : null;
}

export async function getDeliveryNoteByNum(num: number): Promise<DeliveryNote> {
  return await salesFetchJson<DeliveryNote>(`/deliveryNote/${num}`);
}

export async function createDeliveryNote(request: CreateOrUpdateDeliveryNoteRequest): Promise<number> {
  const res = await salesFetch("/deliveryNote", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }

  const created = parseCreatedNumberFromLocation(res.headers.get("location"));
  if (!created) throw new Error("Create succeeded but could not read created delivery note number");
  return created;
}

export async function updateDeliveryNote(num: number, request: CreateOrUpdateDeliveryNoteRequest): Promise<void> {
  const res = await salesFetch(`/deliveryNote/${num}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
}

export async function validateDeliveryNote(num: number): Promise<void> {
  await salesFetchJson("api/delivery-notes/validate", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ids: [num] }),
  });
}

export async function validateDeliveryNotes(nums: number[]): Promise<void> {
  await salesFetchJson("api/delivery-notes/validate", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ids: nums }),
  });
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

export async function exportDeliveryNotesExcel(params: {
  startDate?: Date | null;
  endDate?: Date | null;
  customerId?: number | null;
  technicianId?: number | null;
  tagIds?: number[] | null;
  status?: number | null;
  orderBy?: string | null;
  selectedColumns?: string[] | null;
}): Promise<Blob> {
  const qs = new URLSearchParams();
  const toApiDateTime = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
      d.getMinutes()
    )}:${pad(d.getSeconds())}`;
  };
  if (params.startDate) qs.set("startDate", toApiDateTime(params.startDate));
  if (params.endDate) qs.set("endDate", toApiDateTime(params.endDate));
  if (params.customerId) qs.set("customerId", String(params.customerId));
  if (params.technicianId) qs.set("technicianId", String(params.technicianId));
  if (params.tagIds?.length) params.tagIds.forEach((id) => qs.append("tagIds", String(id)));
  if (params.status !== undefined && params.status !== null) qs.set("status", String(params.status));
  if (params.orderBy) qs.set("orderBy", params.orderBy);
  if (params.selectedColumns?.length) params.selectedColumns.forEach((c) => qs.append("selectedColumns", c));

  return await downloadFromEndpoint(
    `/api/delivery-notes/export/excel?${qs.toString()}`,
    `DeliveryNotes_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "")}.xlsx`
  );
}

export async function exportDeliveryNotesPdf(params: {
  startDate?: Date | null;
  endDate?: Date | null;
  customerId?: number | null;
  technicianId?: number | null;
  tagIds?: number[] | null;
  status?: number | null;
  orderBy?: string | null;
  selectedColumns?: string[] | null;
}): Promise<Blob> {
  const qs = new URLSearchParams();
  const toApiDateTime = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
      d.getMinutes()
    )}:${pad(d.getSeconds())}`;
  };
  if (params.startDate) qs.set("startDate", toApiDateTime(params.startDate));
  if (params.endDate) qs.set("endDate", toApiDateTime(params.endDate));
  if (params.customerId) qs.set("customerId", String(params.customerId));
  if (params.technicianId) qs.set("technicianId", String(params.technicianId));
  if (params.tagIds?.length) params.tagIds.forEach((id) => qs.append("tagIds", String(id)));
  if (params.status !== undefined && params.status !== null) qs.set("status", String(params.status));
  if (params.orderBy) qs.set("orderBy", params.orderBy);
  if (params.selectedColumns?.length) params.selectedColumns.forEach((c) => qs.append("selectedColumns", c));

  return await downloadFromEndpoint(
    `/api/delivery-notes/export/pdf?${qs.toString()}`,
    `DeliveryNotes_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "")}.pdf`
  );
}

export async function getDeliveryNotesWithSummaries(params: {
  pageNumber?: number;
  pageSize?: number;
  customerId?: number | null;
  invoiceId?: number | null;
  isInvoiced?: boolean | null;
  sortOrder?: string | null;
  sortProperty?: string | null;
  searchKeyword?: string | null;
  startDate?: string | null; // yyyy-MM-dd
  endDate?: string | null; // yyyy-MM-dd
  status?: number | null;
  technicianId?: number | null;
  tagIds?: number[] | null;
}): Promise<DeliveryNotesSummariesResponse> {
  const qs = new URLSearchParams();
  if (params.pageNumber) qs.set("pageNumber", String(params.pageNumber));
  if (params.pageSize) qs.set("pageSize", String(params.pageSize));
  if (params.customerId != null) qs.set("customerId", String(params.customerId));
  if (params.invoiceId != null) qs.set("invoiceId", String(params.invoiceId));
  if (params.isInvoiced != null) qs.set("isInvoiced", String(params.isInvoiced));
  if (params.sortOrder) qs.set("sortOrder", params.sortOrder);
  if (params.sortProperty) qs.set("sortProperty", params.sortProperty);
  if (params.searchKeyword) qs.set("searchKeyword", params.searchKeyword);
  if (params.startDate) qs.set("startDate", params.startDate);
  if (params.endDate) qs.set("endDate", params.endDate);
  if (params.status != null) qs.set("status", String(params.status));
  if (params.technicianId != null) qs.set("technicianId", String(params.technicianId));
  if (params.tagIds?.length) {
    for (const id of params.tagIds) qs.append("tagIds", String(id));
  }

  const suffix = qs.toString();
  return await salesFetchJson<DeliveryNotesSummariesResponse>(
    `/deliverynotes/summaries${suffix ? `?${suffix}` : ""}`
  );
}

export async function attachDeliveryNotesToInvoice(request: {
  invoiceId: number;
  deliveryNoteIds: number[];
}): Promise<void> {
  const res = await salesFetch(`/deliveryNote/attachToInvoice`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
}

export async function detachDeliveryNotesFromInvoice(request: {
  invoiceId: number;
  deliveryNoteIds: number[];
}): Promise<void> {
  const res = await salesFetch(`/deliveryNote/detachFromInvoice`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
}

