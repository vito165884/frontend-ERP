"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable, type Column } from "@/components/ui/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CustomerCombobox } from "@/components/inputs/customer-combobox";
import { TagsMultiSelect } from "@/components/inputs/tags-multi-select";
import { exportInvoicesExcel, exportInvoicesPdf, getInvoiceTotals, type InvoiceBaseInfo } from "@/lib/api/invoices";
import { salesFetchJson } from "@/lib/http";
import { FileDown, Table2, Search } from "lucide-react";

type ODataEnvelope<T> = { value: T[]; ["@odata.count"]?: number };

function normalizeInvoiceBaseInfo(i: any): InvoiceBaseInfo {
  // OData often returns PascalCase properties; normalize to our camelCase shape.
  return {
    number: Number(i?.number ?? i?.Number),
    date: String(i?.date ?? i?.Date ?? ""),
    customerId: Number(i?.customerId ?? i?.CustomerId ?? 0),
    customerName: (i?.customerName ?? i?.CustomerName ?? null) as string | null,
    customerCode: (i?.customerCode ?? i?.CustomerCode ?? null) as string | null,
    netAmount: Number(i?.netAmount ?? i?.NetAmount ?? 0),
    vatAmount: Number(i?.vatAmount ?? i?.VatAmount ?? 0),
    statut: Number(i?.statut ?? i?.Statut ?? 0),
    statutLibelle: (i?.statutLibelle ?? i?.StatutLibelle ?? null) as string | null,
  };
}

function toApiDateTime(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}:${pad(d.getSeconds())}`;
}

function formatMoney(n: number): string {
  try {
    return new Intl.NumberFormat(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(n);
  } catch {
    return String(n);
  }
}

function downloadBlob(blob: Blob, fallbackFilename: string) {
  const filename = (blob as any).__filename || fallbackFilename;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function InvoicesAdvancedPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [period, setPeriod] = useState<string>("CurrentYear");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [tagIds, setTagIds] = useState<number[]>([]);
  const [status, setStatus] = useState<string>("all");

  const [columnsVisibility, setColumnsVisibility] = useState<Record<string, boolean>>({
    Number: true,
    Date: true,
    CustomerName: true,
    NetAmount: true,
    VatAmount: true,
    StatutLibelle: true,
  });

  const [rows, setRows] = useState<InvoiceBaseInfo[]>([]);
  const [filteredRows, setFilteredRows] = useState<InvoiceBaseInfo[]>([]);
  const [totals, setTotals] = useState<any | null>(null);

  useEffect(() => {
    const now = new Date();
    setStartDate(new Date(now.getFullYear(), 0, 1, 0, 0, 0));
    setEndDate(new Date(now.getFullYear(), 11, 31, 23, 59, 59));
  }, []);

  useEffect(() => {
    const now = new Date();
    if (period === "CurrentMonth") {
      setStartDate(new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0));
      setEndDate(new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59));
    } else if (period === "CurrentYear") {
      setStartDate(new Date(now.getFullYear(), 0, 1, 0, 0, 0));
      setEndDate(new Date(now.getFullYear(), 11, 31, 23, 59, 59));
    }
  }, [period]);

  const columns = useMemo(() => {
    const cols: Column<InvoiceBaseInfo>[] = [
      {
        key: "number",
        label: "Number",
        sortable: true,
        width: "140px",
        render: (v) => <span className="text-foreground font-medium">{String(v)}</span>,
      },
      {
        key: "date",
        label: "Date",
        sortable: true,
        width: "160px",
        render: (v) => {
          const dt = v ? new Date(String(v)) : null;
          return <span className="text-muted-foreground">{dt ? dt.toLocaleDateString() : "-"}</span>;
        },
      },
      { key: "customerName", label: "Customer", sortable: true, width: "240px", render: (v) => v ?? "-" },
      { key: "netAmount", label: "Total Net", sortable: true, width: "140px", render: (v) => formatMoney(Number(v)) },
      { key: "vatAmount", label: "Total VAT", sortable: true, width: "140px", render: (v) => formatMoney(Number(v)) },
      {
        key: "statutLibelle",
        label: "Status",
        sortable: true,
        width: "120px",
        render: (_v, row) => (
          <Badge className={row.statut === 1 ? "bg-emerald-400/20 text-emerald-300" : "bg-gray-400/20 text-gray-300"}>
            {row.statut === 1 ? "Validated" : "Draft"}
          </Badge>
        ),
      },
    ];

    const mapKeyToName: Record<string, string> = {
      number: "Number",
      date: "Date",
      customerName: "CustomerName",
      netAmount: "NetAmount",
      vatAmount: "VatAmount",
      statutLibelle: "StatutLibelle",
    };

    return cols.filter((c) => columnsVisibility[mapKeyToName[String(c.key)]] !== false);
  }, [columnsVisibility]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams();
      qs.set("$top", "100");
      qs.set("$orderby", "Number asc");
      if (startDate) qs.set("startDate", toApiDateTime(startDate));
      if (endDate) qs.set("endDate", toApiDateTime(endDate));
      if (customerId) qs.set("customerId", String(customerId));
      if (tagIds.length) tagIds.forEach((id) => qs.append("tagIds", String(id)));

      // Status filtering is done server-side in Razor by injecting into OData filter;
      // here we do a best-effort client side filter after fetch.
      // Sales.Api OData route prefix is `/odata`
      const resp = await salesFetchJson<ODataEnvelope<InvoiceBaseInfo>>(`/odata/InvoiceBaseInfos?${qs.toString()}`);
      const items = (resp.value ?? []).map(normalizeInvoiceBaseInfo);
      const filtered =
        status === "all"
          ? items
          : items.filter((i) => i.statut === Number(status));

      setRows(items);
      setFilteredRows(filtered);

      const totalsResp = await getInvoiceTotals({
        startDate,
        endDate,
        customerId,
        tagIds: tagIds.length ? tagIds : null,
        status: status === "all" ? null : Number(status),
      });
      setTotals(totalsResp);
    } catch (e: any) {
      setError(e?.message || "Failed to load invoices (advanced)");
      setRows([]);
      setFilteredRows([]);
      setTotals(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!startDate || !endDate) return;
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate?.toISOString(), endDate?.toISOString()]);

  const selectedColumns = useMemo(() => {
    const all = ["Number", "Date", "CustomerName", "NetAmount", "VatAmount", "StatutLibelle"];
    return all.filter((c) => columnsVisibility[c] !== false);
  }, [columnsVisibility]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold text-foreground">Invoices - Advanced list</h1>
          <p className="text-muted-foreground">Advanced filtering (OData) with exports and totals.</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={async () => {
              const blob = await exportInvoicesExcel({
                startDate,
                endDate,
                customerId,
                tagIds: tagIds.length ? tagIds : null,
                status: status === "all" ? null : Number(status),
                selectedColumns,
              });
              downloadBlob(blob, "Factures.xlsx");
            }}
            disabled={loading}
            title="Export Excel"
          >
            <Table2 className="h-4 w-4" />
            Excel
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={async () => {
              const blob = await exportInvoicesPdf({
                startDate,
                endDate,
                customerId,
                tagIds: tagIds.length ? tagIds : null,
                status: status === "all" ? null : Number(status),
                selectedColumns,
              });
              downloadBlob(blob, "Factures.pdf");
            }}
            disabled={loading}
            title="Export PDF"
          >
            <FileDown className="h-4 w-4" />
            PDF
          </Button>
        </div>
      </div>

      <Card className="p-4 border-border">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
          <div className="space-y-1 md:col-span-2">
            <div className="text-sm text-muted-foreground">Period</div>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Current Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CurrentMonth">Current Month</SelectItem>
                <SelectItem value="CurrentYear">Current Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1 md:col-span-4">
            <div className="text-sm text-muted-foreground">Customer</div>
            <CustomerCombobox value={customerId} onChange={(id) => setCustomerId(id)} />
          </div>

          <div className="space-y-1 md:col-span-2">
            <div className="text-sm text-muted-foreground">Status</div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="0">Draft</SelectItem>
                <SelectItem value="1">Validated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1 md:col-span-3">
            <div className="text-sm text-muted-foreground">Tags</div>
            <TagsMultiSelect value={tagIds} onChange={(ids) => setTagIds(ids)} />
          </div>

          <div className="md:col-span-1 flex gap-2 md:justify-end">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={load}
              disabled={loading}
              title="Search"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground">Columns</div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Choose columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Visible columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {Object.keys(columnsVisibility).map((c) => {
                const visible = columnsVisibility[c] !== false;
                return (
                  <DropdownMenuItem
                    key={c}
                    onSelect={(e) => {
                      e.preventDefault();
                      setColumnsVisibility((prev) => ({ ...prev, [c]: !visible }));
                    }}
                    className="flex items-center justify-between"
                  >
                    <span>{c}</span>
                    <span className="text-xs text-muted-foreground">{visible ? "Shown" : "Hidden"}</span>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DataTable
            columns={columns}
            data={filteredRows}
            title="Invoices"
            description="Advanced list (OData)"
            searchPlaceholder="Search..."
            onSearchChange={(t) => {
              const q = t.trim().toLowerCase();
              const base = status === "all" ? rows : rows.filter((i) => i.statut === Number(status));
              setFilteredRows(
                base.filter(
                  (i) =>
                    String(i.number).includes(q) ||
                    (i.customerName ?? "").toLowerCase().includes(q) ||
                    (i.statutLibelle ?? "").toLowerCase().includes(q)
                )
              );
            }}
            loading={loading}
            rowId={(r) => r.number}
          />
        </div>

        <Card className="p-6 border-border h-fit">
          <div className="text-sm font-semibold text-foreground mb-3">Totals</div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Total Excl. Tax</span>
              <span className="text-foreground font-semibold">{formatMoney(totals?.totalHT ?? 0)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Base HT 7%</span>
              <span className="text-foreground">{formatMoney(totals?.totalBase7 ?? 0)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Base HT 13%</span>
              <span className="text-foreground">{formatMoney(totals?.totalBase13 ?? 0)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Base HT 19%</span>
              <span className="text-foreground">{formatMoney(totals?.totalBase19 ?? 0)}</span>
            </div>

            <div className="pt-3 border-t border-border/60" />

            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">TVA 7%</span>
              <span className="text-foreground">{formatMoney(totals?.totalVat7 ?? 0)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">TVA 13%</span>
              <span className="text-foreground">{formatMoney(totals?.totalVat13 ?? 0)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">TVA 19%</span>
              <span className="text-foreground">{formatMoney(totals?.totalVat19 ?? 0)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Total VAT</span>
              <span className="text-foreground font-semibold">{formatMoney(totals?.totalVat ?? 0)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Total Incl. Tax</span>
              <span className="text-foreground font-semibold">{formatMoney(totals?.totalTTC ?? 0)}</span>
            </div>
          </div>
        </Card>
      </div>

      {error ? (
        <Card className="p-4 border-border">
          <div className="text-sm text-red-600">{error}</div>
        </Card>
      ) : null}
    </div>
  );
}

