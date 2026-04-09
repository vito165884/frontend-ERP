"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, CheckCircle2, Plus } from "lucide-react";
import { ProviderCombobox } from "@/components/inputs/provider-combobox";
import { toast } from "@/hooks/use-toast";
import {
  getProviderCreditNotesWithSummaries,
  validateProviderCreditNotes,
  type ProviderCreditNoteBaseInfo,
} from "@/lib/api/provider-credit-notes";

function formatMoney(n: number): string {
  try {
    return new Intl.NumberFormat(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(n);
  } catch {
    return String(n);
  }
}

const columns: Column<ProviderCreditNoteBaseInfo>[] = [
  {
    key: "numAvoirChezFournisseur",
    label: "Credit note #",
    sortable: true,
    width: "150px",
    render: (value) => (
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-orange-400" />
        <span className="font-medium text-foreground">{value}</span>
      </div>
    ),
  },
  { key: "fournisseurName", label: "Supplier", sortable: true, render: (v) => <span className="text-foreground">{v ?? "-"}</span> },
  {
    key: "date",
    label: "Date",
    sortable: true,
    width: "140px",
    render: (value) => {
      const raw = String(value ?? "");
      const dt = raw ? new Date(raw) : null;
      return <span className="text-muted-foreground">{dt ? dt.toLocaleDateString() : "-"}</span>;
    },
  },
  {
    key: "numFactureAvoirFournisseur",
    label: "Credit invoice #",
    sortable: true,
    width: "150px",
    render: (value) => <code className="text-xs bg-muted px-2 py-1 rounded text-foreground">{String(value ?? "-")}</code>,
  },
  {
    key: "totalExcludingTaxAmount",
    label: "Total HT",
    sortable: true,
    width: "140px",
    render: (value) => <span className="text-foreground">{formatMoney(Number(value))}</span>,
  },
  {
    key: "totalVATAmount",
    label: "TVA",
    sortable: true,
    width: "120px",
    render: (value) => <span className="text-muted-foreground">{formatMoney(Number(value))}</span>,
  },
  {
    key: "totalIncludingTaxAmount",
    label: "Total TTC",
    sortable: true,
    width: "150px",
    render: (value) => <span className="font-semibold text-orange-400">{formatMoney(Number(value))}</span>,
  },
  {
    key: "statut",
    label: "Status",
    sortable: true,
    width: "120px",
    render: (value, row) => {
      const v = Number(value);
      const label = v === 1 ? "validated" : "draft";
      const colors: Record<string, string> = {
        validated: "bg-emerald-400/20 text-emerald-300",
        draft: "bg-gray-400/20 text-gray-300",
      };
      return (
        <Badge className={colors[label]} title={row.statutLibelle || undefined}>
          {label}
        </Badge>
      );
    },
  },
];

export default function SupplierCreditNotesPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [period, setPeriod] = useState<string>("CurrentMonth");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [providerId, setProviderId] = useState<number | null>(null);
  const [status, setStatus] = useState<string>("all");

  const [rows, setRows] = useState<ProviderCreditNoteBaseInfo[]>([]);
  const [filteredRows, setFilteredRows] = useState<ProviderCreditNoteBaseInfo[]>([]);
  const [selected, setSelected] = useState<ProviderCreditNoteBaseInfo[]>([]);
  const [totals, setTotals] = useState<{ net: number; vat: number; ttc: number }>({ net: 0, vat: 0, ttc: 0 });

  useEffect(() => {
    const now = new Date();
    const s = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
    const e = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    setPeriod("CurrentMonth");
    setStartDate(s);
    setEndDate(e);
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

  async function load() {
    if (!startDate || !endDate) return;
    setLoading(true);
    setError(null);
    try {
      const resp = await getProviderCreditNotesWithSummaries({
        pageNumber: 1,
        pageSize: 50,
        fournisseurId: providerId,
        startDate,
        endDate,
        status: status === "all" ? null : Number(status),
        sortProperty: "Date",
        sortOrder: "desc",
      });

      const items = resp.avoirFournisseurs?.items ?? [];
      setRows(items);
      setFilteredRows(items);
      setSelected([]);
      setTotals({
        net: Number(resp.totalNetAmount ?? 0),
        vat: Number(resp.totalVatAmount ?? 0),
        ttc: Number(resp.totalIncludingTaxAmount ?? 0),
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to load supplier credit notes";
      setError(msg);
      setRows([]);
      setFilteredRows([]);
      setSelected([]);
      setTotals({ net: 0, vat: 0, ttc: 0 });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!startDate || !endDate) return;
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate?.toISOString(), endDate?.toISOString()]);

  useEffect(() => {
    setSelected([]);
  }, [status, providerId]);

  const kpis = useMemo(() => {
    const drafts = rows.filter((r) => r.statut !== 1).length;
    return { drafts };
  }, [rows]);

  const handleSearch = (searchTerm: string) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) {
      setFilteredRows(rows);
      return;
    }
    setFilteredRows(
      rows.filter(
        (n) =>
          String(n.numAvoirChezFournisseur).includes(q) ||
          String(n.numFactureAvoirFournisseur ?? "").includes(q) ||
          (n.fournisseurName ?? "").toLowerCase().includes(q) ||
          (n.statutLibelle ?? "").toLowerCase().includes(q)
      )
    );
  };

  async function onValidateSelection() {
    try {
      const draft = selected.filter((r) => r.statut !== 1);
      const ids = draft.map((d) => d.id);
      if (!ids.length) {
        toast({ title: "Nothing to validate", description: "Select draft credit note(s) only.", variant: "destructive" });
        return;
      }
      if (!confirm(`Validate ${ids.length} supplier credit note(s)?`)) return;
      await validateProviderCreditNotes(ids);
      await load();
      toast({ title: "Validated", description: `${ids.length} credit note(s) validated.` });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Validation failed";
      setError(msg);
      toast({ title: "Validation failed", description: msg, variant: "destructive" });
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-2">
          <h1 className="text-5xl font-bold text-foreground">Supplier credit notes</h1>
          <p className="text-muted-foreground text-base">List and validate supplier credit notes (Avoir fournisseur).</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" asChild>
            <Link href="/manage-provider-credit-notes">Manage</Link>
          </Button>
          <Button asChild>
            <Link href="/supplier-credit-notes/create" className="inline-flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add credit note
            </Link>
          </Button>
          <Button variant="outline" className="gap-2" onClick={onValidateSelection} disabled={!selected.length || loading}>
            <CheckCircle2 className="h-4 w-4" />
            Validate selection
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
          <div className="space-y-1 md:col-span-2">
            <div className="text-sm text-muted-foreground">Supplier</div>
            <ProviderCombobox value={providerId} onChange={(id) => setProviderId(id)} />
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
          <div className="flex gap-2 md:justify-end">
            <Button onClick={load} disabled={loading || !startDate || !endDate} className="w-full">
              {loading ? "Loading…" : "Search"}
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-6 border-border">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Total credit notes</p>
          <p className="text-4xl font-bold text-foreground mt-3">{rows.length}</p>
          <p className="text-sm text-muted-foreground mt-2">This page</p>
        </Card>
        <Card className="p-6 border-border">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Total HT</p>
          <p className="text-4xl font-bold text-foreground mt-3">{formatMoney(totals.net)}</p>
          <p className="text-sm text-muted-foreground mt-2">Period + filters</p>
        </Card>
        <Card className="p-6 border-border">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Total TVA</p>
          <p className="text-4xl font-bold text-foreground mt-3">{formatMoney(totals.vat)}</p>
          <p className="text-sm text-muted-foreground mt-2">Period + filters</p>
        </Card>
        <Card className="p-6 border-border">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Draft notes</p>
          <p className="text-4xl font-bold text-yellow-400 mt-3">{kpis.drafts}</p>
          <p className="text-sm text-muted-foreground mt-2">Pending validation</p>
        </Card>
      </div>

      <DataTable
        columns={columns}
        data={filteredRows}
        title="Supplier credit notes"
        description="Select draft credit notes to validate in bulk"
        searchPlaceholder="Search by #, supplier, credit invoice, status…"
        onSearchChange={handleSearch}
        loading={loading}
        selectable
        rowId={(r) => r.id}
        onSelectionChange={setSelected}
      />

      {error ? (
        <Card className="p-4 border-border">
          <div className="text-sm text-red-600">{error}</div>
        </Card>
      ) : null}
    </div>
  );
}
