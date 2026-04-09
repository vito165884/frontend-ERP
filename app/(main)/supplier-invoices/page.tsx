"use client";

import { useEffect, useMemo, useState } from "react";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, CheckCircle2, FileDown } from "lucide-react";
import { ProviderCombobox } from "@/components/inputs/provider-combobox";
import { TagsMultiSelect } from "@/components/inputs/tags-multi-select";
import { toast } from "@/hooks/use-toast";
import {
  exportProviderInvoicesSageErp,
  fetchProviderInvoiceBaseInfos,
  getProviderInvoiceTotals,
  validateProviderInvoices,
  type ProviderInvoiceBaseInfo,
} from "@/lib/api/provider-invoices";

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

function applyStatusFilter(items: ProviderInvoiceBaseInfo[], s: string) {
  if (s === "all") return items;
  const want = Number(s);
  return items.filter((i) => i.statut === want);
}

const baseColumns: Column<ProviderInvoiceBaseInfo>[] = [
  {
    key: "number",
    label: "Invoice #",
    sortable: true,
    width: "130px",
    render: (value) => (
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium text-foreground">{value}</span>
      </div>
    ),
  },
  {
    key: "providerName",
    label: "Supplier",
    sortable: true,
    render: (value) => <span className="text-foreground">{value ?? "-"}</span>,
  },
  {
    key: "providerInvoiceNumber",
    label: "Supplier ref.",
    sortable: true,
    width: "140px",
    render: (value) => (
      <code className="text-xs bg-muted px-2 py-1 rounded text-foreground">{String(value ?? "-")}</code>
    ),
  },
  {
    key: "date",
    label: "Date",
    sortable: true,
    width: "120px",
    render: (value) => {
      const raw = String(value ?? "");
      const dt = raw ? new Date(raw) : null;
      return <span className="text-muted-foreground">{dt ? dt.toLocaleDateString() : "-"}</span>;
    },
  },
  {
    key: "netAmount",
    label: "Total (HT)",
    sortable: true,
    width: "140px",
    render: (value) => <span className="font-semibold text-foreground">{formatMoney(Number(value))}</span>,
  },
  {
    key: "vatAmount",
    label: "TVA",
    sortable: true,
    width: "120px",
    render: (value) => <span className="text-muted-foreground">{formatMoney(Number(value))}</span>,
  },
  {
    key: "statut",
    label: "Status",
    sortable: true,
    width: "120px",
    render: (value, row) => {
      const v = Number(value);
      const colors: Record<string, string> = {
        validated: "bg-emerald-400/20 text-emerald-300",
        draft: "bg-gray-400/20 text-gray-300",
      };
      const label = v === 1 ? "validated" : "draft";
      const lib = (row.statutLibelle ?? "").trim();
      const text = lib && !/^-?\d+$/.test(lib) ? lib : label;
      return (
        <Badge className={colors[label]} title={lib || undefined}>
          {text}
        </Badge>
      );
    },
  },
];

export default function SupplierInvoicesPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [period, setPeriod] = useState<string>("CurrentMonth");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedProviderId, setSelectedProviderId] = useState<number | null>(null);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [status, setStatus] = useState<string>("all");

  const [invoices, setInvoices] = useState<ProviderInvoiceBaseInfo[]>([]);
  const [selectedRows, setSelectedRows] = useState<ProviderInvoiceBaseInfo[]>([]);
  const [apiTotals, setApiTotals] = useState<Awaited<ReturnType<typeof getProviderInvoiceTotals>> | null>(null);
  const [tableSearch, setTableSearch] = useState("");

  const filteredByStatus = useMemo(() => applyStatusFilter(invoices, status), [invoices, status]);

  const displayRows = useMemo(() => {
    const t = tableSearch.trim().toLowerCase();
    if (!t) return filteredByStatus;
    return filteredByStatus.filter(
      (i) =>
        String(i.number).includes(t) ||
        String(i.providerInvoiceNumber ?? "").includes(t) ||
        (i.providerName ?? "").toLowerCase().includes(t) ||
        (i.statutLibelle ?? "").toLowerCase().includes(t)
    );
  }, [filteredByStatus, tableSearch]);

  async function load() {
    if (!startDate || !endDate) return;
    setLoading(true);
    setError(null);
    try {
      const raw = await fetchProviderInvoiceBaseInfos({
        startDate,
        endDate,
        providerId: selectedProviderId,
        tagIds: selectedTagIds.length ? selectedTagIds : undefined,
      });
      setInvoices(raw);
      setSelectedRows([]);

      const t = await getProviderInvoiceTotals({
        startDate,
        endDate,
        providerId: selectedProviderId,
        tagIds: selectedTagIds.length ? selectedTagIds : null,
        status: status === "all" ? null : Number(status),
      });
      setApiTotals(t);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to load supplier invoices";
      setError(msg);
      setInvoices([]);
      setSelectedRows([]);
      setApiTotals(null);
    } finally {
      setLoading(false);
    }
  }

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

  useEffect(() => {
    const now = new Date();
    const s = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
    const e = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    setPeriod("CurrentMonth");
    setStartDate(s);
    setEndDate(e);
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const raw = await fetchProviderInvoiceBaseInfos({
          startDate: s,
          endDate: e,
          providerId: null,
          tagIds: undefined,
        });
        setInvoices(raw);
        setSelectedRows([]);
        const t = await getProviderInvoiceTotals({
          startDate: s,
          endDate: e,
          providerId: null,
          tagIds: null,
          status: null,
        });
        setApiTotals(t);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to load supplier invoices";
        setError(msg);
        setInvoices([]);
        setApiTotals(null);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setSelectedRows([]);
  }, [status]);

  const handleSearch = (searchTerm: string) => {
    setTableSearch(searchTerm);
  };

  async function onValidateSelection() {
    try {
      const draft = selectedRows.filter((r) => r.statut !== 1);
      const ids = draft.map((i) => i.number);
      if (!ids.length) {
        toast({ title: "Nothing to validate", description: "Select draft invoice(s) only.", variant: "destructive" });
        return;
      }
      if (!confirm(`Validate ${ids.length} supplier invoice(s)?`)) return;
      await validateProviderInvoices(ids);
      await load();
      toast({ title: "Validated", description: `${ids.length} invoice(s) validated.` });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Validation failed";
      setError(msg);
      toast({ title: "Validation failed", description: msg, variant: "destructive" });
    }
  }

  async function onValidateOne(num: number) {
    try {
      if (!confirm(`Validate supplier invoice #${num}?`)) return;
      await validateProviderInvoices([num]);
      await load();
      toast({ title: "Validated", description: `Invoice #${num} validated.` });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Validation failed";
      setError(msg);
      toast({ title: "Validation failed", description: msg, variant: "destructive" });
    }
  }

  async function onExportSage() {
    try {
      const blob = await exportProviderInvoicesSageErp({
        startDate,
        endDate,
        providerId: selectedProviderId,
        tagIds: selectedTagIds.length ? selectedTagIds : null,
      });
      downloadBlob(blob, "FacturesFournisseurs_Sage.txt");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Export failed";
      setError(msg);
      toast({ title: "Export Sage failed", description: msg, variant: "destructive" });
    }
  }

  const columnsWithActions: Column<ProviderInvoiceBaseInfo>[] = [
    ...baseColumns,
    {
      id: "actions",
      key: "number",
      label: "Actions",
      sortable: false,
      width: "120px",
      render: (_value, row) => (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            disabled={row.statut === 1 || loading}
            onClick={() => onValidateOne(row.number)}
            title="Validate"
          >
            Validate
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-2">
          <h1 className="text-5xl font-bold text-foreground">Manage supplier invoices</h1>
          <p className="text-muted-foreground text-base">
            List, filter, validate, and export supplier invoices (OData + API, same as Razor).
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            className="gap-2"
            onClick={onValidateSelection}
            disabled={!selectedRows.length || loading}
          >
            <CheckCircle2 className="h-4 w-4" />
            Validate selection
          </Button>
          <Button variant="outline" className="gap-2" onClick={onExportSage} disabled={loading}>
            <FileDown className="h-4 w-4" />
            Export Sage
          </Button>
        </div>
      </div>

      <Card className="p-4 border-border">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Period</div>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger>
                <SelectValue placeholder="Current Month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CurrentMonth">Current Month</SelectItem>
                <SelectItem value="CurrentYear">Current Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Supplier</div>
            <ProviderCombobox value={selectedProviderId} onChange={(id) => setSelectedProviderId(id)} />
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Status</div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="0">Draft</SelectItem>
                <SelectItem value="1">Validated</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1 md:col-span-2">
            <div className="text-sm text-muted-foreground">Tags</div>
            <TagsMultiSelect value={selectedTagIds} onChange={(ids) => setSelectedTagIds(ids)} />
          </div>
          <div className="flex gap-2 md:justify-end">
            <Button onClick={load} disabled={loading || !startDate || !endDate} className="w-full">
              {loading ? "Loading…" : "Search"}
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-6 border-border">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Rows (filtered)</p>
          <p className="text-4xl font-bold text-foreground mt-3">{displayRows.length}</p>
          <p className="text-sm text-muted-foreground mt-2">In table after status + search</p>
        </Card>
        <Card className="p-6 border-border">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Total HT (API)</p>
          <p className="text-4xl font-bold text-foreground mt-3">{formatMoney(apiTotals?.totalHT ?? 0)}</p>
          <p className="text-sm text-muted-foreground mt-2">Period + filters</p>
        </Card>
        <Card className="p-6 border-border">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Total TVA (API)</p>
          <p className="text-4xl font-bold text-foreground mt-3">{formatMoney(apiTotals?.totalVat ?? 0)}</p>
          <p className="text-sm text-muted-foreground mt-2">Period + filters</p>
        </Card>
        <Card className="p-6 border-border">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Total TTC (API)</p>
          <p className="text-4xl font-bold text-foreground mt-3">{formatMoney(apiTotals?.totalTTC ?? 0)}</p>
          <p className="text-sm text-muted-foreground mt-2">Period + filters</p>
        </Card>
      </div>

      <DataTable
        columns={columnsWithActions}
        data={displayRows}
        title="Supplier invoice list"
        description="Select draft invoices to validate in bulk"
        searchPlaceholder="Search by #, supplier ref., supplier, status…"
        onSearchChange={handleSearch}
        loading={loading}
        selectable
        rowId={(row) => row.number}
        onSelectionChange={setSelectedRows}
      />

      {error ? (
        <Card className="p-4 border-border">
          <div className="text-sm text-red-600">{error}</div>
        </Card>
      ) : null}
    </div>
  );
}
