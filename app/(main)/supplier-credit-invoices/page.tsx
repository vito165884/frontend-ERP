"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, CheckCircle2, Search } from "lucide-react";
import { ProviderCombobox } from "@/components/inputs/provider-combobox";
import { toast } from "@/hooks/use-toast";
import {
  getFactureAvoirFournisseurSummaries,
  validateFactureAvoirFournisseurs,
  type FactureAvoirFournisseurBaseInfo,
} from "@/lib/api/facture-avoir-fournisseur";

function formatMoney(n: number): string {
  try {
    return new Intl.NumberFormat(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(n);
  } catch {
    return String(n);
  }
}
export default function SupplierCreditInvoicesPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [period, setPeriod] = useState<string>("CurrentYear");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [providerId, setProviderId] = useState<number | null>(null);
  const [status, setStatus] = useState<string>("all");
  const [searchKeyword, setSearchKeyword] = useState("");

  const [rows, setRows] = useState<FactureAvoirFournisseurBaseInfo[]>([]);
  const [totals, setTotals] = useState<{ net: number; vat: number; ttc: number } | null>(null);
  const [selected, setSelected] = useState<FactureAvoirFournisseurBaseInfo[]>([]);

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

  const load = useCallback(async () => {
    if (!startDate || !endDate) return;
    setLoading(true);
    setError(null);
    try {
      const resp = await getFactureAvoirFournisseurSummaries({
        pageNumber: 1,
        pageSize: 100,
        idFournisseur: providerId,
        sortOrder: "desc",
        sortProperty: "Date",
        searchKeyword: searchKeyword.trim() ? searchKeyword.trim() : null,
        startDate,
        endDate,
      });
      let items = resp.factureAvoirFournisseurs?.items ?? [];
      if (status !== "all") {
        const want = Number(status);
        items = items.filter((i) => i.statut === want);
      }
      setRows(items);
      setTotals({
        net: Number(resp.totalNetAmount ?? 0),
        vat: Number(resp.totalVatAmount ?? 0),
        ttc: Number(resp.totalIncludingTaxAmount ?? 0),
      });
      setSelected([]);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to load supplier credit invoices";
      setError(msg);
      setRows([]);
      setTotals(null);
      setSelected([]);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, providerId, searchKeyword, status]);

  useEffect(() => {
    if (!startDate || !endDate) return;
    void load();
  }, [startDate, endDate, load]);

  const columns: Column<FactureAvoirFournisseurBaseInfo>[] = useMemo(() => {
    const cols: Column<FactureAvoirFournisseurBaseInfo>[] = [
      {
        key: "statut",
        label: "Status",
        sortable: true,
        width: "120px",
        render: (_v, row) => (
          <Badge className={row.statut === 1 ? "bg-emerald-400/20 text-emerald-300" : "bg-gray-400/20 text-gray-300"}>
            {row.statut === 1 ? "Validated" : "Draft"}
          </Badge>
        ),
      },
      {
        key: "id",
        label: "Id",
        sortable: true,
        width: "90px",
        render: (v) => <span className="text-muted-foreground font-mono text-xs">{String(v)}</span>,
      },
      {
        key: "numFactureAvoirFourSurPage",
        label: "N°",
        sortable: true,
        width: "120px",
        render: (v) => (
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-foreground">{String(v)}</span>
          </div>
        ),
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
      { key: "fournisseurName", label: "Supplier", sortable: true, width: "220px", render: (v) => v ?? "-" },
      {
        key: "numFactureFournisseur",
        label: "Supplier inv. #",
        sortable: true,
        width: "140px",
        render: (v) => <code className="text-xs bg-muted px-2 py-1 rounded">{v != null ? String(v) : "—"}</code>,
      },
      {
        key: "totalExcludingTaxAmount",
        label: "Total HT",
        sortable: true,
        width: "130px",
        render: (v) => <span className="text-foreground">{formatMoney(Number(v))}</span>,
      },
      {
        key: "totalVATAmount",
        label: "TVA",
        sortable: true,
        width: "120px",
        render: (v) => <span className="text-muted-foreground">{formatMoney(Number(v))}</span>,
      },
      {
        key: "totalIncludingTaxAmount",
        label: "Total TTC",
        sortable: true,
        width: "130px",
        render: (v) => <span className="text-foreground">{formatMoney(Number(v))}</span>,
      },
      {
        id: "actions",
        key: "id",
        label: "Actions",
        sortable: false,
        width: "120px",
        render: (_v, row) => (
          <Button
            variant="outline"
            size="sm"
            disabled={row.statut === 1 || loading}
            onClick={async () => {
              try {
                if (!confirm(`Validate credit invoice id ${row.id}?`)) return;
                await validateFactureAvoirFournisseurs([row.id]);
                await load();
                toast({ title: "Validated" });
              } catch (e: unknown) {
                const msg = e instanceof Error ? e.message : "Validate failed";
                toast({ title: "Validate failed", description: msg, variant: "destructive" });
              }
            }}
          >
            Validate
          </Button>
        ),
      },
    ];
    return cols;
  }, [load, loading]);

  async function onValidateSelection() {
    const ids = selected.filter((r) => r.statut !== 1).map((r) => r.id);
    if (!ids.length) {
      toast({ title: "Nothing to validate", description: "Select draft credit invoice(s).", variant: "destructive" });
      return;
    }
    if (!confirm(`Validate ${ids.length} credit invoice(s)?`)) return;
    try {
      await validateFactureAvoirFournisseurs(ids);
      await load();
      toast({ title: "Validated", description: `${ids.length} item(s).` });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Validate failed";
      setError(msg);
      toast({ title: "Validate failed", description: msg, variant: "destructive" });
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold text-foreground">Supplier credit invoices</h1>
          <p className="text-muted-foreground">Facture avoir fournisseur — list and validate.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" asChild>
            <Link href="/manage-provider-credit-notes">Manage</Link>
          </Button>
          <Button variant="outline" className="gap-2" onClick={onValidateSelection} disabled={loading || !selected.length}>
            <CheckCircle2 className="h-4 w-4" />
            Validate selection
          </Button>
        </div>
      </div>

      <Card className="p-4 border-border">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-2 items-end">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Period</div>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="h-9">
                <SelectValue />
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
          <div className="space-y-1 md:col-span-1">
            <div className="text-sm text-muted-foreground">Search</div>
            <input
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
              placeholder="Keyword…"
            />
          </div>
          <div className="flex gap-2 md:justify-end">
            <Button variant="outline" size="icon" className="h-9 w-9" onClick={load} disabled={loading} title="Search">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {error ? (
        <Card className="p-4 border-border">
          <div className="text-sm text-red-600">{error}</div>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DataTable
            columns={columns}
            data={rows}
            title="Credit invoices"
            description="Facture avoir fournisseur"
            searchPlaceholder="Filter table…"
            onSearchChange={() => {}}
            loading={loading}
            selectable
            rowId={(r) => r.id}
            onSelectionChange={setSelected}
          />
        </div>
        <Card className="p-6 border-border h-fit">
          <div className="text-sm font-semibold text-foreground mb-3">Totals (API)</div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Total HT</span>
              <span className="text-foreground font-semibold">{formatMoney(totals?.net ?? 0)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Total TVA</span>
              <span className="text-foreground font-semibold">{formatMoney(totals?.vat ?? 0)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Total TTC</span>
              <span className="text-foreground font-semibold">{formatMoney(totals?.ttc ?? 0)}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
