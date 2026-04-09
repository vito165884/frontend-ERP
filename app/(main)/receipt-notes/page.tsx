"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, Search, Truck } from "lucide-react";
import { ProviderCombobox } from "@/components/inputs/provider-combobox";
import { TagsMultiSelect } from "@/components/inputs/tags-multi-select";
import { toast } from "@/hooks/use-toast";
import { getReceiptNotesList, validateReceiptNotes, type ReceiptNoteBaseInfo } from "@/lib/api/provider-receipt-notes";

function formatMoney(n: number): string {
  try {
    return new Intl.NumberFormat(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(n);
  } catch {
    return String(n);
  }
}

export default function ReceiptNotesPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [period, setPeriod] = useState<string>("CurrentMonth");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [providerId, setProviderId] = useState<number | null>(null);
  const [tagIds, setTagIds] = useState<number[]>([]);
  const [status, setStatus] = useState<string>("all");

  const [rows, setRows] = useState<ReceiptNoteBaseInfo[]>([]);
  const [totals, setTotals] = useState<{ gross: number; vat: number; net: number } | null>(null);
  const [selected, setSelected] = useState<ReceiptNoteBaseInfo[]>([]);

  useEffect(() => {
    const now = new Date();
    const s = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
    const e = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
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

  const load = useCallback(async () => {
    if (!startDate || !endDate) return;
    setLoading(true);
    setError(null);
    try {
      const resp = await getReceiptNotesList({
        startDate,
        endDate,
        providerId,
        tagIds: tagIds.length ? tagIds : null,
        status: status === "all" ? null : Number(status),
        page: 1,
        pageSize: 100,
        sortBy: "date",
        sortDescending: true,
      });
      setRows(resp.receiptNotes ?? []);
      setTotals({
        gross: Number(resp.totals?.totalGrossAmount ?? 0),
        vat: Number(resp.totals?.totalVatAmount ?? 0),
        net: Number(resp.totals?.totalNetAmount ?? 0),
      });
      setSelected([]);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to load receipt notes";
      setError(msg);
      setRows([]);
      setTotals(null);
      setSelected([]);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, providerId, tagIds, status]);

  useEffect(() => {
    void load();
  }, [load]);

  const columns: Column<ReceiptNoteBaseInfo>[] = useMemo(
    () => [
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
        key: "number",
        label: "Receipt #",
        sortable: true,
        width: "120px",
        render: (v) => (
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold">{String(v)}</span>
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
        key: "supplierReceiptNumber",
        label: "Supplier receipt #",
        sortable: true,
        width: "150px",
        render: (v) => <code className="text-xs bg-muted px-2 py-1 rounded">{String(v)}</code>,
      },
      {
        key: "grossAmount",
        label: "Total HT",
        sortable: true,
        width: "120px",
        render: (v) => <span>{formatMoney(Number(v))}</span>,
      },
      {
        key: "vatAmount",
        label: "TVA",
        sortable: true,
        width: "110px",
        render: (v) => <span className="text-muted-foreground">{formatMoney(Number(v))}</span>,
      },
      {
        key: "netAmount",
        label: "Net",
        sortable: true,
        width: "120px",
        render: (v) => <span className="font-medium">{formatMoney(Number(v))}</span>,
      },
      {
        id: "actions",
        key: "number",
        label: "Actions",
        sortable: false,
        width: "110px",
        render: (_v, row) => (
          <Button
            variant="outline"
            size="sm"
            disabled={row.statut === 1 || loading}
            onClick={async () => {
              try {
                if (!confirm(`Validate receipt note #${row.number}?`)) return;
                await validateReceiptNotes([row.number]);
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
    ],
    [load, loading]
  );

  async function onValidateSelection() {
    const nums = selected.filter((r) => r.statut !== 1).map((r) => r.number);
    if (!nums.length) {
      toast({ title: "Nothing to validate", description: "Select draft receipt note(s).", variant: "destructive" });
      return;
    }
    if (!confirm(`Validate ${nums.length} receipt note(s)?`)) return;
    try {
      await validateReceiptNotes(nums);
      await load();
      toast({ title: "Validated", description: `${nums.length} receipt note(s).` });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Validate failed";
      setError(msg);
      toast({ title: "Validate failed", description: msg, variant: "destructive" });
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Receipt notes</h1>
          <p className="text-muted-foreground mt-2">Bon de réception (Razor: /reciption_notes). GET /api/receipt-notes/list.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" asChild>
            <Link href="/purchase-order">Purchase order</Link>
          </Button>
          <Button variant="outline" className="gap-2" onClick={onValidateSelection} disabled={loading || !selected.length}>
            <CheckCircle2 className="h-4 w-4" />
            Validate selection
          </Button>
        </div>
      </div>

      <Card className="p-4 border-border">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <div className="space-y-1 md:col-span-2">
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
          <div className="space-y-1 md:col-span-3">
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
          <div className="space-y-1 md:col-span-4">
            <div className="text-sm text-muted-foreground">Tags</div>
            <TagsMultiSelect value={tagIds} onChange={setTagIds} />
          </div>
          <div className="md:col-span-1 flex justify-end">
            <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => void load()} disabled={loading} title="Search">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card className="p-5 border-border">
          <p className="text-xs font-bold text-muted-foreground uppercase">Total HT</p>
          <p className="text-2xl font-bold mt-1">{formatMoney(totals?.gross ?? 0)}</p>
        </Card>
        <Card className="p-5 border-border">
          <p className="text-xs font-bold text-muted-foreground uppercase">Total TVA</p>
          <p className="text-2xl font-bold mt-1">{formatMoney(totals?.vat ?? 0)}</p>
        </Card>
        <Card className="p-5 border-border">
          <p className="text-xs font-bold text-muted-foreground uppercase">Net</p>
          <p className="text-2xl font-bold mt-1">{formatMoney(totals?.net ?? 0)}</p>
        </Card>
        <Card className="p-5 border-border">
          <p className="text-xs font-bold text-muted-foreground uppercase">Rows</p>
          <p className="text-2xl font-bold mt-1">{rows.length}</p>
        </Card>
      </div>

      <DataTable
        columns={columns}
        data={rows}
        title="Receipt notes"
        description="Goods receipt from suppliers"
        loading={loading}
        selectable
        rowId={(r) => r.number}
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
