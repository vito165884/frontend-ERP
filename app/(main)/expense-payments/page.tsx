"use client";

import { useEffect, useState } from "react";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Wallet, RefreshCw, Trash2 } from "lucide-react";
import { TiersDepenseCombobox } from "@/components/inputs/tiers-depense-combobox";
import { getAccountingYears } from "@/lib/api/accounting-years";
import {
  deletePaiementTiersDepense,
  getPaiementsTiersDepenses,
  type PaiementTiersDepenseRow,
} from "@/lib/api/paiements-tiers-depenses";

type Row = PaiementTiersDepenseRow;

const columns = (onDelete: (id: number) => void): Column<Row>[] => [
  {
    key: "id",
    label: "Payment #",
    sortable: true,
    width: "120px",
    render: (value) => (
      <div className="flex items-center gap-2">
        <Wallet className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium text-foreground">{value}</span>
      </div>
    ),
  },
  { key: "tiersDepenseFonctionnementNom", label: "Vendor", sortable: true },
  { key: "datePaiement", label: "Date", sortable: true },
  {
    key: "montant",
    label: "Amount",
    sortable: true,
    render: (value) => <span className="font-semibold text-foreground">{Number(value ?? 0).toLocaleString()}</span>,
  },
  { key: "methodePaiement", label: "Method", sortable: true },
  { key: "numeroTransactionBancaire", label: "Bank ref", sortable: false },
  {
    id: "actions",
    key: "id",
    label: "",
    sortable: false,
    width: "70px",
    render: (value) => (
      <Button variant="ghost" size="icon" onClick={() => onDelete(Number(value))} title="Delete">
        <Trash2 className="h-4 w-4" />
      </Button>
    ),
  },
];

export default function ExpensePaymentsPage() {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [tiersId, setTiersId] = useState<number | null>(null);
  const [accountingYearId, setAccountingYearId] = useState<number | null>(null);
  const [years, setYears] = useState<{ id: number; year: number }[]>([]);
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  useEffect(() => {
    void (async () => {
      const ys = await getAccountingYears();
      setYears(ys.map((y) => ({ id: y.id, year: y.year })));
    })();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await getPaiementsTiersDepenses({
        pageNumber: 1,
        pageSize: 50,
        tiersDepenseFonctionnementId: tiersId,
        accountingYearId,
        datePaiementFrom: dateFrom || null,
        datePaiementTo: dateTo || null,
      });
      setRows(res.items);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onDelete(id: number) {
    await deletePaiementTiersDepense(id);
    await load();
  }

  return (
    <div className="space-y-6 p-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Expense Payments</h1>
        <p className="text-muted-foreground text-base">Payments for operating expenses.</p>
      </div>

      <Card className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Vendor</label>
            <TiersDepenseCombobox value={tiersId} onChange={(id) => setTiersId(id)} />
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Accounting year</label>
            <select
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={accountingYearId ?? ""}
              onChange={(e) => setAccountingYearId(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">All</option>
              {years.map((y) => (
                <option key={y.id} value={y.id}>
                  {y.year}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Date from</label>
            <Input value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} placeholder="YYYY-MM-DD" />
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Date to</label>
            <Input value={dateTo} onChange={(e) => setDateTo(e.target.value)} placeholder="YYYY-MM-DD" />
          </div>
          <div className="md:col-span-2 flex gap-2">
            <Button
              onClick={() => {
                void load();
              }}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Apply
            </Button>
            <Button variant="outline" onClick={() => void load()} disabled={loading}>
              Refresh
            </Button>
          </div>
        </div>

        <DataTable
          title="Expense Payments"
          description="View and manage all expense payments"
          data={rows as any}
          columns={columns(onDelete) as any}
          loading={loading}
          searchPlaceholder="Search…"
          onSearchChange={() => {
            // Server-side list; use filters + Apply.
          }}
        />
      </Card>
    </div>
  );
}
