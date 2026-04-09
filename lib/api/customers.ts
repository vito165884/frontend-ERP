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

export type Customer = {
  id: number;
  name?: string | null;
  tel?: string | null;
  adresse?: string | null;
  matricule?: string | null;
  code?: string | null;
  codeCat?: string | null;
  etbSec?: string | null;
  mail?: string | null;
};

export type CreateCustomerRequest = {
  nom: string;
  tel: string;
  adresse: string;
  matricule: string;
  code: string;
  codeCat: string;
  etbSec: string;
  mail: string;
};

export type UpdateCustomerRequest = {
  nom: string;
  tel?: string | null;
  adresse?: string | null;
  matricule?: string | null;
  code?: string | null;
  codeCat?: string | null;
  etbSec?: string | null;
  mail?: string | null;
};

export async function getCustomers(params: {
  pageNumber: number;
  pageSize: number;
  searchKeyword?: string | null;
}): Promise<PagedList<Customer>> {
  const qs = new URLSearchParams();
  qs.set("pageNumber", String(params.pageNumber));
  qs.set("pageSize", String(params.pageSize));
  if (params.searchKeyword) qs.set("searchKeyword", params.searchKeyword);
  return await salesFetchJson<PagedList<Customer>>(`/customers?${qs.toString()}`);
}

export async function getCustomerById(id: number): Promise<Customer> {
  return await salesFetchJson<Customer>(`/customers/${id}`);
}

export async function createCustomer(request: CreateCustomerRequest): Promise<number> {
  const res = await salesFetch("/customers", {
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
  if (!Number.isFinite(n)) throw new Error("Create succeeded but could not read created customer id");
  return n;
}

export async function updateCustomer(id: number, request: UpdateCustomerRequest): Promise<void> {
  const res = await salesFetch(`/customers/${id}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
}

export async function deleteCustomer(id: number): Promise<void> {
  const res = await salesFetch(`/customers/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
}

