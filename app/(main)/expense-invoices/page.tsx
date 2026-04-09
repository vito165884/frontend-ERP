"use client";

import { useEffect, useState } from "react";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Receipt, RefreshCw, FileDown, CheckCircle, Trash2 } from "lucide-react";
import { TiersDepenseCombobox } from "@/components/inputs/tiers-depense-combobox";
import { getAccountingYears } from "@/lib/api/accounting-years";
import {
  deleteFactureDepense,
  exportFactureDepenseTejXml,
  getFacturesDepenses,
  getFacturesDepensesTotals,
  validateFactureDepense,
  type FactureDepenseSummaryItem,
} from "@/lib/api/factures-depenses";

type Row = FactureDepenseSummaryItem;

function downloadBlob(blob: Blob, fallbackName: string) {
  const anyBlob = blob as any;
  const filename = (anyBlob?.__filename as string | undefined) ?? fallbackName;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

const columns = (actions: {
  onValidate: (id: number) => void;
  onDelete: (id: number) => void;
  onTej: (id: number) => void;
}): Column<Row>[] => [
  {
    key: "numero",
    label: "Invoice #",
    sortable: true,
    width: "120px",
    render: (value) => (
      <div className="flex items-center gap-2">
        <Receipt className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium text-foreground">{value}</span>
      </div>
    ),
  },
  { key: "tiersDepenseFonctionnementNom", label: "Vendor", sortable: true },
  { key: "date", label: "Date", sortable: true },
  {
    key: "totalTtc",
    label: "TTC",
    sortable: true,
    render: (value) => <span className="font-semibold text-foreground">{Number(value ?? 0).toLocaleString()}</span>,
  },
  { key: "statutLibelle", label: "Status", sortable: true },
  {
    key: "id",
    label: "",
    sortable: false,
    width: "140px",
    render: (value) => (
      <div className="flex justify-end gap-1">
        <Button variant="ghost" size="icon" title="Validate" onClick={() => actions.onValidate(Number(value))}>
          <CheckCircle className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" title="TEJ XML" onClick={() => actions.onTej(Number(value))}>
          <FileDown className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" title="Delete" onClick={() => actions.onDelete(Number(value))}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
];

export default function ExpenseInvoicesPage() {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [tiersId, setTiersId] = useState<number | null>(null);
  const [accountingYearId, setAccountingYearId] = useState<number | null>(null);
  const [years, setYears] = useState<{ id: number; year: number }[]>([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [totals, setTotals] = useState<{ totalHt: number; totalTva: number; totalTtc: number } | null>(null);

  useEffect(() => {
    void (async () => {
      const ys = await getAccountingYears();
      setYears(ys.map((y) => ({ id: y.id, year: y.year })));
    })();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await getFacturesDepenses({
        pageNumber: 1,
        pageSize: 50,
        tiersDepenseFonctionnementId: tiersId,
        accountingYearId,
        searchKeyword: searchKeyword || null,
        startDate: startDate || null,
        endDate: endDate || null,
      });
      setRows(res.items);

      const t = await getFacturesDepensesTotals({
        accountingYearId,
        tiersDepenseFonctionnementId: tiersId,
        startDate: startDate || null,
        endDate: endDate || null,
      });
      setTotals(t);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onValidate(id: number) {
    await validateFactureDepense(id);
    await load();
  }

  async function onDelete(id: number) {
    await deleteFactureDepense(id);
    await load();
  }

  async function onTej(id: number) {
    const blob = await exportFactureDepenseTejXml(id);
    downloadBlob(blob, `facture-depense-${id}.xml`);
  }

  return (
    <div className="space-y-6 p-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Expense Invoices</h1>
        <p className="text-muted-foreground text-base">Invoices for operating expenses (with TEJ export).</p>
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
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Search</label>
            <Input value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} placeholder="Number, vendor..." />
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Start date</label>
            <Input value={startDate} onChange={(e) => setStartDate(e.target.value)} placeholder="YYYY-MM-DD" />
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">End date</label>
            <Input value={endDate} onChange={(e) => setEndDate(e.target.value)} placeholder="YYYY-MM-DD" />
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

        {totals ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Card className="p-4">
              <div className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Total HT</div>
              <div className="text-2xl font-bold">{totals.totalHt.toLocaleString()}</div>
            </Card>
            <Card className="p-4">
              <div className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Total TVA</div>
              <div className="text-2xl font-bold">{totals.totalTva.toLocaleString()}</div>
            </Card>
            <Card className="p-4">
              <div className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Total TTC</div>
              <div className="text-2xl font-bold">{totals.totalTtc.toLocaleString()}</div>
            </Card>
          </div>
        ) : null}

        <DataTable
          title="Expense Invoice List"
          description="View and manage all expense invoices"
          data={rows as any}
          columns={columns({ onValidate, onDelete, onTej }) as any}
          loading={loading}
          searchPlaceholder="Search…"
          onSearchChange={(v) => setSearchKeyword(v)}
        />
      </Card>
    </div>
  );
}
