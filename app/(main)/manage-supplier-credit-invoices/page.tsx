"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DataTable, type Column } from "@/components/ui/data-table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ProviderCombobox } from "@/components/inputs/provider-combobox";
import { toast } from "@/hooks/use-toast";
import {
  attachFactureAvoirFournisseurToInvoice,
  detachFactureAvoirFournisseurFromInvoice,
  getFactureAvoirFournisseurSummaries,
  type FactureAvoirFournisseurBaseInfo,
} from "@/lib/api/facture-avoir-fournisseur";

function formatMoney(n: number): string {
  try {
    return new Intl.NumberFormat(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(n);
  } catch {
    return String(n);
  }
}

const colBase = (loading: boolean): Column<FactureAvoirFournisseurBaseInfo>[] => [
  {
    key: "id",
    label: "Id",
    sortable: true,
    width: "80px",
    render: (v) => <span className="font-mono text-xs text-muted-foreground">{String(v)}</span>,
  },
  {
    key: "numFactureAvoirFourSurPage",
    label: "N°",
    sortable: true,
    width: "100px",
    render: (v) => <span className="font-medium">{String(v)}</span>,
  },
  {
    key: "date",
    label: "Date",
    sortable: true,
    width: "120px",
    render: (v) => {
      const dt = v ? new Date(String(v)) : null;
      return <span className="text-muted-foreground">{dt ? dt.toLocaleDateString() : "-"}</span>;
    },
  },
  {
    key: "totalIncludingTaxAmount",
    label: "Total TTC",
    sortable: true,
    width: "120px",
    render: (v) => <span className={loading ? "opacity-70" : ""}>{formatMoney(Number(v))}</span>,
  },
  {
    key: "statut",
    label: "Status",
    sortable: true,
    width: "100px",
    render: (_v, row) => (
      <span className="text-xs text-muted-foreground">{row.statut === 1 ? "validated" : "draft"}</span>
    ),
  },
];

export default function ManageSupplierCreditInvoicesPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [providerId, setProviderId] = useState<number | null>(null);
  const [factureFournisseurNum, setFactureFournisseurNum] = useState<string>("");

  const [period, setPeriod] = useState<string>("CurrentYear");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const [attached, setAttached] = useState<FactureAvoirFournisseurBaseInfo[]>([]);
  const [pool, setPool] = useState<FactureAvoirFournisseurBaseInfo[]>([]);
  const [selectedAttached, setSelectedAttached] = useState<FactureAvoirFournisseurBaseInfo[]>([]);
  const [selectedPool, setSelectedPool] = useState<FactureAvoirFournisseurBaseInfo[]>([]);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState("Confirm");
  const [confirmDescription, setConfirmDescription] = useState<string | null>(null);
  const [onConfirm, setOnConfirm] = useState<(() => Promise<void>) | null>(null);

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

  const invoiceNumParsed = useMemo(() => {
    const n = Number(factureFournisseurNum.trim());
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [factureFournisseurNum]);

  const loadData = useCallback(async () => {
    if (!providerId || !startDate || !endDate) {
      setAttached([]);
      setPool([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const common = {
        idFournisseur: providerId,
        startDate,
        endDate,
        pageNumber: 1,
        pageSize: 200,
        sortProperty: "Date",
        sortOrder: "desc" as const,
      };

      const allResp = await getFactureAvoirFournisseurSummaries(common);
      const allItems = allResp.factureAvoirFournisseurs?.items ?? [];
      const unattached = allItems.filter((x) => x.numFactureFournisseur == null);

      setPool(unattached);
      setSelectedPool([]);

      if (invoiceNumParsed != null) {
        const linkedResp = await getFactureAvoirFournisseurSummaries({
          ...common,
          numFactureFournisseur: invoiceNumParsed,
        });
        setAttached(linkedResp.factureAvoirFournisseurs?.items ?? []);
      } else {
        setAttached([]);
      }
      setSelectedAttached([]);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to load data";
      setError(msg);
      setAttached([]);
      setPool([]);
    } finally {
      setLoading(false);
    }
  }, [providerId, startDate, endDate, invoiceNumParsed]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const attachedCols = useMemo(() => colBase(loading), [loading]);
  const poolCols = useMemo(() => colBase(loading), [loading]);

  return (
    <div className="space-y-6 p-6">
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmTitle}</AlertDialogTitle>
            {confirmDescription ? <AlertDialogDescription>{confirmDescription}</AlertDialogDescription> : null}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={loading}
              onClick={async () => {
                setConfirmOpen(false);
                if (onConfirm) await onConfirm();
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold text-foreground">Manage supplier credit invoices</h1>
          <p className="text-muted-foreground">
            Link facture avoir fournisseur documents to a supplier invoice (internal #, same as supplier invoice list).
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/manage-provider-credit-notes">Hub</Link>
        </Button>
      </div>

      <Card className="p-6 border-border">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-3 space-y-2">
            <Label>Supplier</Label>
            <ProviderCombobox value={providerId} onChange={(id) => setProviderId(id)} />
          </div>
          <div className="md:col-span-2 space-y-2">
            <Label>Period</Label>
            <select
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              <option value="CurrentMonth">Current month</option>
              <option value="CurrentYear">Current year</option>
            </select>
          </div>
          <div className="md:col-span-3 space-y-2">
            <Label>Supplier invoice # (facture fournisseur)</Label>
            <Input
              value={factureFournisseurNum}
              onChange={(e) => setFactureFournisseurNum(e.target.value)}
              placeholder="e.g. 12345"
              inputMode="numeric"
            />
          </div>
          <div className="md:col-span-2 flex gap-2">
            <Button className="w-full" disabled={loading || !providerId} onClick={() => void loadData()}>
              Refresh
            </Button>
          </div>
        </div>
        {invoiceNumParsed == null ? (
          <p className="text-sm text-muted-foreground mt-3">Enter a supplier invoice # to load credit invoices already linked to that invoice.</p>
        ) : null}
      </Card>

      <DataTable
        columns={attachedCols}
        data={attached}
        title="Credit invoices linked to this supplier invoice"
        description={invoiceNumParsed ? `Supplier invoice #${invoiceNumParsed}` : "Enter supplier invoice #"}
        loading={loading}
        selectable
        rowId={(r) => r.id}
        onSelectionChange={setSelectedAttached}
      />

      <div className="flex justify-end">
        <Button
          variant="destructive"
          disabled={!selectedAttached.length || loading || invoiceNumParsed == null}
          onClick={() => {
            if (invoiceNumParsed == null) return;
            setConfirmTitle("Detach credit invoices");
            setConfirmDescription(
              `Detach ${selectedAttached.length} credit invoice(s) from supplier invoice #${invoiceNumParsed}?`
            );
            setOnConfirm(() => async () => {
              try {
                await detachFactureAvoirFournisseurFromInvoice({
                  factureFournisseurId: invoiceNumParsed,
                  factureAvoirFournisseurIds: selectedAttached.map((x) => x.id),
                });
                toast({ title: "Detached" });
                await loadData();
              } catch (e: unknown) {
                const msg = e instanceof Error ? e.message : "Detach failed";
                setError(msg);
                toast({ title: "Detach failed", description: msg, variant: "destructive" });
              }
            });
            setConfirmOpen(true);
          }}
        >
          Detach selected
        </Button>
      </div>

      <DataTable
        columns={poolCols}
        data={pool}
        title="Credit invoices not linked to a supplier invoice"
        description="Select items to attach to the supplier invoice above"
        loading={loading}
        selectable
        rowId={(r) => r.id}
        onSelectionChange={setSelectedPool}
      />

      <div className="flex justify-end">
        <Button
          disabled={!selectedPool.length || loading || invoiceNumParsed == null}
          onClick={() => {
            if (invoiceNumParsed == null) {
              toast({ title: "Supplier invoice # required", variant: "destructive" });
              return;
            }
            setConfirmTitle("Attach credit invoices");
            setConfirmDescription(
              `Attach ${selectedPool.length} credit invoice(s) to supplier invoice #${invoiceNumParsed}?`
            );
            setOnConfirm(() => async () => {
              try {
                await attachFactureAvoirFournisseurToInvoice({
                  factureFournisseurId: invoiceNumParsed,
                  factureAvoirFournisseurIds: selectedPool.map((x) => x.id),
                });
                toast({ title: "Attached" });
                await loadData();
              } catch (e: unknown) {
                const msg = e instanceof Error ? e.message : "Attach failed";
                setError(msg);
                toast({ title: "Attach failed", description: msg, variant: "destructive" });
              }
            });
            setConfirmOpen(true);
          }}
        >
          Attach selected to supplier invoice
        </Button>
      </div>

      {error ? (
        <Card className="p-4 border-border">
          <div className="text-sm text-red-600">{error}</div>
        </Card>
      ) : null}
    </div>
  );
}
