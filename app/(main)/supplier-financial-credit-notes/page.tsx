"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Search, Trash2 } from "lucide-react";
import { ProviderCombobox } from "@/components/inputs/provider-combobox";
import { toast } from "@/hooks/use-toast";
import {
  deleteAvoirFinancierFournisseur,
  getAvoirFinancierFournisseursWithSummaries,
  validateAvoirFinancierFournisseurs,
  type AvoirFinancierFournisseurBaseInfo,
} from "@/lib/api/avoir-financier-fournisseur";

function formatMoney(n: number): string {
  try {
    return new Intl.NumberFormat(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(n);
  } catch {
    return String(n);
  }
}

export default function SupplierFinancialCreditNotesPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [period, setPeriod] = useState<string>("CurrentYear");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [providerId, setProviderId] = useState<number | null>(null);
  const [searchKeyword, setSearchKeyword] = useState("");

  const [rows, setRows] = useState<AvoirFinancierFournisseurBaseInfo[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);

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
      const resp = await getAvoirFinancierFournisseursWithSummaries({
        pageNumber: 1,
        pageSize: 100,
        providerId,
        sortOrder: "desc",
        sortProperty: "Date",
        searchKeyword: searchKeyword.trim() ? searchKeyword.trim() : null,
        startDate,
        endDate,
      });
      setRows(resp.avoirFinancierFournisseurs?.items ?? []);
      setTotalAmount(Number(resp.totalAmount ?? 0));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to load financial credit notes";
      setError(msg);
      setRows([]);
      setTotalAmount(0);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, providerId, searchKeyword]);

  useEffect(() => {
    void load();
  }, [load]);

  const columns: Column<AvoirFinancierFournisseurBaseInfo>[] = useMemo(
    () => [
      {
        key: "num",
        label: "N°",
        sortable: true,
        width: "100px",
        render: (v) => (
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{String(v)}</span>
          </div>
        ),
      },
      {
        key: "date",
        label: "Date",
        sortable: true,
        width: "130px",
        render: (v) => {
          const dt = v ? new Date(String(v)) : null;
          return <span className="text-muted-foreground">{dt ? dt.toLocaleDateString() : "-"}</span>;
        },
      },
      { key: "providerName", label: "Supplier", sortable: true, render: (v) => v ?? "-" },
      {
        key: "providerInvoiceNumber",
        label: "Supplier inv. ref.",
        sortable: true,
        width: "140px",
        render: (v) => <code className="text-xs bg-muted px-2 py-1 rounded">{String(v)}</code>,
      },
      {
        key: "numFactureFournisseur",
        label: "Linked inv. #",
        sortable: true,
        width: "120px",
        render: (v) => <span className="font-mono text-xs">{String(v)}</span>,
      },
      {
        key: "description",
        label: "Description",
        sortable: false,
        render: (v) => <span className="text-muted-foreground truncate max-w-[200px] block">{String(v ?? "—")}</span>,
      },
      {
        key: "totTtc",
        label: "Total TTC",
        sortable: true,
        width: "130px",
        render: (v) => <span className="font-semibold text-foreground">{formatMoney(Number(v))}</span>,
      },
      {
        id: "actions",
        key: "num",
        label: "Actions",
        sortable: false,
        width: "200px",
        render: (_v, row) => (
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                try {
                  if (!confirm(`Validate financial credit #${row.num}?`)) return;
                  await validateAvoirFinancierFournisseurs([row.num]);
                  toast({ title: "OK", description: "Validation recorded (API checks existence)." });
                  await load();
                } catch (e: unknown) {
                  const msg = e instanceof Error ? e.message : "Failed";
                  toast({ title: "Validate failed", description: msg, variant: "destructive" });
                }
              }}
            >
              Validate
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive"
              onClick={async () => {
                if (!confirm(`Delete financial credit row id ${row.id}?`)) return;
                try {
                  await deleteAvoirFinancierFournisseur(row.id);
                  toast({ title: "Deleted" });
                  await load();
                } catch (e: unknown) {
                  const msg = e instanceof Error ? e.message : "Delete failed";
                  toast({ title: "Delete failed", description: msg, variant: "destructive" });
                }
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [load]
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold text-foreground">Supplier financial credit notes</h1>
          <p className="text-muted-foreground">Avoir financier fournisseurs (Razor: /avoir-financier-fournisseurs).</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/manage-provider-credit-notes">Provider credit hub</Link>
        </Button>
      </div>

      <Card className="p-4 border-border">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Period</div>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CurrentMonth">Current month</SelectItem>
                <SelectItem value="CurrentYear">Current year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1 md:col-span-2">
            <div className="text-sm text-muted-foreground">Supplier</div>
            <ProviderCombobox value={providerId} onChange={(id) => setProviderId(id)} />
          </div>
          <div className="space-y-1 md:col-span-2">
            <div className="text-sm text-muted-foreground">Search</div>
            <input
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              placeholder="Keyword…"
            />
          </div>
          <div className="flex justify-end">
            <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => void load()} disabled={loading}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-6 border-border">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Total TTC (filtered)</p>
          <p className="text-3xl font-bold text-foreground mt-2">{formatMoney(totalAmount)}</p>
        </Card>
        <Card className="p-6 border-border">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Rows</p>
          <p className="text-3xl font-bold text-foreground mt-2">{rows.length}</p>
        </Card>
      </div>

      <DataTable
        columns={columns}
        data={rows}
        title="Financial credits"
        description="Supplier-side financial adjustments"
        loading={loading}
        rowId={(r) => r.num}
      />

      {error ? (
        <Card className="p-4 border-border">
          <div className="text-sm text-red-600">{error}</div>
        </Card>
      ) : null}
    </div>
  );
}
