"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, Search } from "lucide-react";
import { ProviderCombobox } from "@/components/inputs/provider-combobox";
import { toast } from "@/hooks/use-toast";
import { getOrdersList, validateOrders, type OrderSummary } from "@/lib/api/orders";

function formatMoney(n: number): string {
  try {
    return new Intl.NumberFormat(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(n);
  } catch {
    return String(n);
  }
}

export default function PurchaseOrdersPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [providerId, setProviderId] = useState<number | null>(null);
  const [status, setStatus] = useState<string>("all");

  const [rows, setRows] = useState<OrderSummary[]>([]);
  const [filtered, setFiltered] = useState<OrderSummary[]>([]);
  const [selected, setSelected] = useState<OrderSummary[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await getOrdersList();
      setRows(list);
      setSelected([]);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to load orders";
      setError(msg);
      setRows([]);
      setFiltered([]);
      setSelected([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    let list = rows;
    if (providerId != null) {
      list = list.filter((r) => r.supplierId === providerId);
    }
    if (status !== "all") {
      const want = Number(status);
      list = list.filter((r) => r.statut === want);
    }
    setFiltered(list);
    setSelected([]);
  }, [rows, providerId, status]);

  const columns: Column<OrderSummary>[] = useMemo(
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
        key: "orderNumber",
        label: "Order #",
        sortable: true,
        width: "120px",
        render: (v) => <span className="font-semibold text-foreground">{String(v)}</span>,
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
      { key: "supplierName", label: "Supplier", sortable: true, render: (v) => v ?? "-" },
      {
        key: "totalExcludingVat",
        label: "Total HT",
        sortable: true,
        width: "130px",
        render: (v) => <span className="text-foreground">{formatMoney(Number(v))}</span>,
      },
      {
        key: "totalVat",
        label: "TVA",
        sortable: true,
        width: "120px",
        render: (v) => <span className="text-muted-foreground">{formatMoney(Number(v))}</span>,
      },
      {
        key: "netToPay",
        label: "Net to pay",
        sortable: true,
        width: "130px",
        render: (v) => <span className="font-medium">{formatMoney(Number(v))}</span>,
      },
      {
        id: "actions",
        key: "orderNumber",
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
                if (!confirm(`Validate order #${row.orderNumber}?`)) return;
                await validateOrders([row.orderNumber]);
                await load();
                toast({ title: "Order validated" });
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
    const nums = selected.filter((r) => r.statut !== 1).map((r) => r.orderNumber);
    if (!nums.length) {
      toast({ title: "Nothing to validate", description: "Select draft order(s).", variant: "destructive" });
      return;
    }
    if (!confirm(`Validate ${nums.length} order(s)?`)) return;
    try {
      await validateOrders(nums);
      await load();
      toast({ title: "Validated", description: `${nums.length} order(s).` });
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
          <h1 className="text-4xl font-bold text-foreground">Orders</h1>
          <p className="text-muted-foreground mt-2">Purchase orders (Razor: /orders, /commandes). Data from GET /api/orders.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" asChild>
            <Link href="/purchase-order">Purchase order (edit)</Link>
          </Button>
          <Button variant="outline" className="gap-2" onClick={onValidateSelection} disabled={loading || !selected.length}>
            <CheckCircle2 className="h-4 w-4" />
            Validate selection
          </Button>
          <Button variant="outline" size="icon" onClick={() => void load()} disabled={loading} title="Refresh">
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card className="p-4 border-border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
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
        </div>
      </Card>

      {error ? (
        <Card className="p-4 border-border">
          <div className="text-sm text-red-600">{error}</div>
        </Card>
      ) : null}

      <DataTable
        columns={columns}
        data={filtered}
        title="Order list"
        description="Filter is client-side (API returns full list)."
        loading={loading}
        selectable
        rowId={(r) => r.orderNumber}
        onSelectionChange={setSelected}
      />
    </div>
  );
}
