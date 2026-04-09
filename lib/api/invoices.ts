import { salesFetch, salesFetchJson } from "@/lib/http";

export type InvoiceBaseInfo = {
  number: number;
  date: string; // DateTimeOffset serialized
  customerId: number;
  customerName?: string | null;
  customerCode?: string | null;
  netAmount: number;
  vatAmount: number;
  statut: number;
  statutLibelle?: string | null;
};

export type InvoiceTotalsResponse = {
  totalHT: number;
  totalVat: number;
  totalTTC: number;
  totalVat7: number;
  totalVat13: number;
  totalVat19: number;
  totalBase7: number;
  totalBase13: number;
  totalBase19: number;
};

export type InvoicesListResponse = {
  invoices: InvoiceBaseInfo[];
  totalCount: number;
  page: number;
  pageSize: number;
  totals: InvoiceTotalsResponse;
};

export async function getInvoicesList(params: {
  startDate?: Date | null;
  endDate?: Date | null;
  customerId?: number | null;
  tagIds?: number[] | null;
  status?: number | null;
  page: number;
  pageSize: number;
  sortBy?: string | null;
  sortDescending?: boolean;
}): Promise<InvoicesListResponse> {
  const qs = new URLSearchParams();

  const toApiDateTime = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
      d.getHours()
    )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  if (params.startDate) qs.set("startDate", toApiDateTime(params.startDate));
  if (params.endDate) qs.set("endDate", toApiDateTime(params.endDate));
  if (params.customerId) qs.set("customerId", String(params.customerId));
  if (params.status !== undefined && params.status !== null) qs.set("status", String(params.status));
  if (params.tagIds?.length) params.tagIds.forEach((id) => qs.append("tagIds", String(id)));

  qs.set("page", String(params.page));
  qs.set("pageSize", String(params.pageSize));
  if (params.sortBy) qs.set("sortBy", params.sortBy);
  if (typeof params.sortDescending === "boolean")
    qs.set("sortDescending", params.sortDescending ? "true" : "false");

  return await salesFetchJson<InvoicesListResponse>(`/api/invoices/list?${qs.toString()}`);
}

export async function getInvoiceTotals(params: {
  startDate?: Date | null;
  endDate?: Date | null;
  customerId?: number | null;
  tagIds?: number[] | null;
  status?: number | null;
}): Promise<InvoiceTotalsResponse> {
  const qs = new URLSearchParams();

  const toApiDateTime = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
      d.getHours()
    )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  if (params.startDate) qs.set("startDate", toApiDateTime(params.startDate));
  if (params.endDate) qs.set("endDate", toApiDateTime(params.endDate));
  if (params.customerId) qs.set("customerId", String(params.customerId));
  if (params.status !== undefined && params.status !== null) qs.set("status", String(params.status));
  if (params.tagIds?.length) params.tagIds.forEach((id) => qs.append("tagIds", String(id)));

  const query = qs.toString();
  return await salesFetchJson<InvoiceTotalsResponse>(`/api/invoices/totals${query ? `?${query}` : ""}`);
}

export async function validateInvoices(ids: number[]): Promise<void> {
  const res = await salesFetch(`/api/invoices/validate`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ids }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
}

export async function getInvoicesByCustomerWithSummary(params: {
  customerId: number;
  pageNumber: number;
  pageSize: number;
  sortOrder: string;
  sortProprety: string;
}): Promise<any> {
  const qs = new URLSearchParams();
  qs.set("pageNumber", String(params.pageNumber));
  qs.set("pageSize", String(params.pageSize));
  qs.set("sortOrder", params.sortOrder);
  qs.set("sortProprety", params.sortProprety);
  return await salesFetchJson<any>(`/invoices/client/${params.customerId}?${qs.toString()}`);
}

export async function createInvoice(request: { date: string; clientId: number }): Promise<number> {
  const res = await salesFetch(`/invoices`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }

  // In the browser, reading `Location` may fail if CORS doesn't expose it.
  // Try Location first, then fall back to querying the latest invoice for this customer.
  const location = res.headers.get("location");
  const last = location?.split("/").filter(Boolean).at(-1);
  const n = last ? Number(last) : NaN;
  if (Number.isFinite(n)) return n;

  try {
    const byCustomer = await getInvoicesByCustomerWithSummary({
      customerId: request.clientId,
      pageNumber: 1,
      pageSize: 10,
      sortOrder: "desc",
      sortProprety: "Number",
    });

    const items: any[] =
      byCustomer?.invoices?.items ??
      byCustomer?.Invoices?.Items ??
      byCustomer?.Invoices?.items ??
      byCustomer?.invoices ??
      [];

    const top = items[0];
    const number = Number(top?.number ?? top?.Number);
    if (Number.isFinite(number)) return number;
  } catch {
    // ignore fallthrough
  }

  throw new Error(
    "Create invoice succeeded but could not read created invoice number (Location header not accessible)"
  );
}

async function downloadFromEndpoint(pathWithQuery: string, fallbackFilename: string): Promise<Blob> {
  const res = await salesFetch(pathWithQuery, { method: "GET" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }

  // We return a Blob and let the caller decide filename.
  const blob = await res.blob();
  (blob as any).__filename =
    res.headers.get("content-disposition")?.match(/filename\*=UTF-8''([^;]+)|filename=\"?([^\";]+)\"?/i)?.[1] ??
    res.headers.get("content-disposition")?.match(/filename=\"?([^\";]+)\"?/i)?.[1] ??
    fallbackFilename;
  return blob;
}

export async function exportInvoicesExcel(params: {
  startDate?: Date | null;
  endDate?: Date | null;
  customerId?: number | null;
  tagIds?: number[] | null;
  status?: number | null;
  selectedColumns?: string[] | null;
  orderBy?: string | null;
}): Promise<Blob> {
  const qs = new URLSearchParams();
  const toApiDateTime = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
      d.getHours()
    )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  if (params.startDate) qs.set("startDate", toApiDateTime(params.startDate));
  if (params.endDate) qs.set("endDate", toApiDateTime(params.endDate));
  if (params.customerId) qs.set("customerId", String(params.customerId));
  if (params.status !== undefined && params.status !== null) qs.set("status", String(params.status));
  if (params.tagIds?.length) params.tagIds.forEach((id) => qs.append("tagIds", String(id)));
  if (params.orderBy) qs.set("orderBy", params.orderBy);
  if (params.selectedColumns?.length)
    params.selectedColumns.forEach((c) => qs.append("selectedColumns", c));

  return await downloadFromEndpoint(
    `/api/invoices/export/excel?${qs.toString()}`,
    `Factures_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "")}.xlsx`
  );
}

export async function exportInvoicesPdf(params: {
  startDate?: Date | null;
  endDate?: Date | null;
  customerId?: number | null;
  tagIds?: number[] | null;
  status?: number | null;
  selectedColumns?: string[] | null;
  orderBy?: string | null;
}): Promise<Blob> {
  const qs = new URLSearchParams();
  const toApiDateTime = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
      d.getHours()
    )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  if (params.startDate) qs.set("startDate", toApiDateTime(params.startDate));
  if (params.endDate) qs.set("endDate", toApiDateTime(params.endDate));
  if (params.customerId) qs.set("customerId", String(params.customerId));
  if (params.status !== undefined && params.status !== null) qs.set("status", String(params.status));
  if (params.tagIds?.length) params.tagIds.forEach((id) => qs.append("tagIds", String(id)));
  if (params.orderBy) qs.set("orderBy", params.orderBy);
  if (params.selectedColumns?.length)
    params.selectedColumns.forEach((c) => qs.append("selectedColumns", c));

  return await downloadFromEndpoint(
    `/api/invoices/export/pdf?${qs.toString()}`,
    `Factures_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "")}.pdf`
  );
}

export async function exportInvoicesSage(params: {
  startDate?: Date | null;
  endDate?: Date | null;
  customerId?: number | null;
  tagIds?: number[] | null;
}): Promise<Blob> {
  const qs = new URLSearchParams();
  const toApiDateTime = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
      d.getHours()
    )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  if (params.startDate) qs.set("startDate", toApiDateTime(params.startDate));
  if (params.endDate) qs.set("endDate", toApiDateTime(params.endDate));
  if (params.customerId) qs.set("customerId", String(params.customerId));
  if (params.tagIds?.length) params.tagIds.forEach((id) => qs.append("tagIds", String(id)));

  return await downloadFromEndpoint(
    `/api/invoices/export/sage?${qs.toString()}`,
    `Factures_Sage_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "")}.txt`
  );
}

