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
import { ProviderCombobox } from "@/components/inputs/provider-combobox";
import { TagsMultiSelect } from "@/components/inputs/tags-multi-select";
import { salesFetchJson } from "@/lib/http";
import {
  exportProviderInvoicesSageErp,
  getProviderInvoiceTotals,
  normalizeProviderInvoiceBaseInfo,
  type ProviderInvoiceBaseInfo,
} from "@/lib/api/provider-invoices";
import { FileDown, Search } from "lucide-react";

type ODataEnvelope<T> = { value: T[]; ["@odata.count"]?: number };

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
  const filename = (blob as Blob & { __filename?: string }).__filename || fallbackFilename;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function SupplierInvoicesAdvancedPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [period, setPeriod] = useState<string>("CurrentYear");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [providerId, setProviderId] = useState<number | null>(null);
  const [tagIds, setTagIds] = useState<number[]>([]);
  const [status, setStatus] = useState<string>("all");

  const [columnsVisibility, setColumnsVisibility] = useState<Record<string, boolean>>({
    Number: true,
    Date: true,
    ProviderName: true,
    ProviderInvoiceNumber: true,
    NetAmount: true,
    VatAmount: true,
    StatutLibelle: true,
  });

  const [rows, setRows] = useState<ProviderInvoiceBaseInfo[]>([]);
  const [filteredRows, setFilteredRows] = useState<ProviderInvoiceBaseInfo[]>([]);
  const [totals, setTotals] = useState<Awaited<ReturnType<typeof getProviderInvoiceTotals>> | null>(null);

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
    const cols: Column<ProviderInvoiceBaseInfo>[] = [
      {
        key: "number",
        label: "Number",
        sortable: true,
        width: "120px",
        render: (v) => <span className="text-foreground font-medium">{String(v)}</span>,
      },
      {
        key: "date",
        label: "Date",
        sortable: true,
        width: "140px",
        render: (v) => {
          const dt = v ? new Date(String(v)) : null;
          return <span className="text-muted-foreground">{dt ? dt.toLocaleDateString() : "-"}</span>;
        },
      },
      { key: "providerName", label: "Supplier", sortable: true, width: "260px", render: (v) => v ?? "-" },
      {
        key: "providerInvoiceNumber",
        label: "Supplier ref.",
        sortable: true,
        width: "160px",
        render: (v) => <code className="text-xs bg-muted px-2 py-1 rounded text-foreground">{String(v ?? "-")}</code>,
      },
      { key: "netAmount", label: "Total HT", sortable: true, width: "140px", render: (v) => formatMoney(Number(v)) },
      { key: "vatAmount", label: "TVA", sortable: true, width: "140px", render: (v) => formatMoney(Number(v)) },
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
      providerName: "ProviderName",
      providerInvoiceNumber: "ProviderInvoiceNumber",
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
      qs.set("$top", "250");
      qs.set("$orderby", "Number desc");
      if (startDate) qs.set("startDate", toApiDateTime(startDate));
      if (endDate) qs.set("endDate", toApiDateTime(endDate));
      if (providerId) qs.set("providerId", String(providerId));
      if (tagIds.length) tagIds.forEach((id) => qs.append("tagIds", String(id)));

      const resp = await salesFetchJson<ODataEnvelope<ProviderInvoiceBaseInfo>>(
        `/odata/ProviderInvoiceBaseInfos?${qs.toString()}`
      );
      const items = (resp.value ?? []).map(normalizeProviderInvoiceBaseInfo);
      const filtered = status === "all" ? items : items.filter((i) => i.statut === Number(status));

      setRows(items);
      setFilteredRows(filtered);

      const totalsResp = await getProviderInvoiceTotals({
        startDate,
        endDate,
        providerId,
        tagIds: tagIds.length ? tagIds : null,
        status: status === "all" ? null : Number(status),
      });
      setTotals(totalsResp);
    } catch (e: any) {
      setError(e?.message || "Failed to load supplier invoices (advanced)");
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
    const all = ["Number", "Date", "ProviderName", "ProviderInvoiceNumber", "NetAmount", "VatAmount", "StatutLibelle"];
    return all.filter((c) => columnsVisibility[c] !== false);
  }, [columnsVisibility]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold text-foreground">Supplier invoices - Advanced list</h1>
          <p className="text-muted-foreground">Advanced filtering (OData) with Sage export and totals.</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={async () => {
              const blob = await exportProviderInvoicesSageErp({
                startDate,
                endDate,
                providerId,
                tagIds: tagIds.length ? tagIds : null,
              });
              downloadBlob(blob, "FacturesFournisseurs_Sage.txt");
            }}
            disabled={loading}
            title="Export Sage"
          >
            <FileDown className="h-4 w-4" />
            Export Sage
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
            <div className="text-sm text-muted-foreground">Supplier</div>
            <ProviderCombobox value={providerId} onChange={(id) => setProviderId(id)} />
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
            <Button variant="outline" size="icon" className="h-9 w-9" onClick={load} disabled={loading} title="Search">
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
            <DropdownMenuContent align="end" className="w-64">
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
            title="Supplier invoices"
            description="Advanced list (OData)"
            searchPlaceholder="Search..."
            onSearchChange={(t) => {
              const q = t.trim().toLowerCase();
              const base = status === "all" ? rows : rows.filter((i) => i.statut === Number(status));
              setFilteredRows(
                base.filter(
                  (i) =>
                    String(i.number).includes(q) ||
                    String(i.providerInvoiceNumber ?? "").includes(q) ||
                    (i.providerName ?? "").toLowerCase().includes(q) ||
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

