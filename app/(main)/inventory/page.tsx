'use client';

import { useEffect, useMemo, useState } from 'react';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { getAccountingYears } from '@/lib/api/accounting-years';
import { createInventaire, getInventaires, exportInventairesLignesExcel, type Inventaire } from '@/lib/api/inventaires';
import { ProductCombobox } from '@/components/inputs/product-combobox';

export default function InventoryPage() {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<Inventaire[]>([]);
  const [years, setYears] = useState<{ id: number; year: number; isActive: boolean }[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [createYearId, setCreateYearId] = useState<number | null>(null);
  const [createDate, setCreateDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [createDescription, setCreateDescription] = useState<string>('');
  const [createLines, setCreateLines] = useState<
    { refProduit: string; quantiteReelle: number; prixHt: number; dernierPrixAchat: number; productName?: string | null }[]
  >([{ refProduit: '', quantiteReelle: 0, prixHt: 0, dernierPrixAchat: 0 }]);

  async function load() {
    setLoading(true);
    try {
      const res = await getInventaires({ pageNumber: 1, pageSize: 50 });
      setRows(res.items);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    void (async () => {
      const ys = await getAccountingYears();
      setYears(ys.map((y) => ({ id: y.id, year: y.year, isActive: y.isActive })));
      const active = ys.find((y) => y.isActive);
      if (active) setCreateYearId(active.id);
    })();
  }, []);

  const columns: Column<Inventaire>[] = [
    { key: 'num', label: 'Num', sortable: true, width: '90px' },
    { key: 'dateInventaire', label: 'Date', sortable: true },
    { key: 'statutLibelle', label: 'Status', sortable: true },
    { key: 'accountingYear', label: 'Year', sortable: true, width: '90px' },
    {
      key: 'totalHt',
      label: 'Total HT',
      sortable: true,
      render: (v) => <span className="font-medium text-foreground">{Number(v ?? 0).toLocaleString()}</span>,
    },
  ];

  function downloadBlob(blob: Blob, fallbackName: string) {
    const anyBlob = blob as any;
    const filename = (anyBlob?.__filename as string | undefined) ?? fallbackName;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function exportAllLines() {
    const ids = rows.map((r) => r.id);
    const blob = await exportInventairesLignesExcel(ids);
    downloadBlob(blob, 'Inventaires_Lignes.xlsx');
  }

  const canCreate = useMemo(() => createYearId != null && !!createDate, [createYearId, createDate]);

  async function doCreate() {
    if (!createYearId) return;
    const lignes = createLines
      .filter((l) => l.refProduit.trim().length > 0)
      .map((l) => ({
        refProduit: l.refProduit.trim(),
        quantiteReelle: Number(l.quantiteReelle ?? 0),
        prixHt: Number(l.prixHt ?? 0),
        dernierPrixAchat: Number(l.dernierPrixAchat ?? 0),
      }));
    await createInventaire({
      accountingYearId: createYearId,
      dateInventaire: createDate,
      description: createDescription || null,
      lignes,
    });
    setCreateOpen(false);
    await load();
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-end gap-2">
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>Create inventory</Button>
          </DialogTrigger>
          <DialogContent className="w-[min(96vw,1100px)] max-w-none max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create inventory</DialogTitle>
            </DialogHeader>

            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
                    Accounting year
                  </label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                    value={createYearId ?? ''}
                    onChange={(e) => setCreateYearId(e.target.value ? Number(e.target.value) : null)}
                  >
                    <option value="">Select…</option>
                    {years.map((y) => (
                      <option key={y.id} value={y.id}>
                        {y.year}
                        {y.isActive ? ' (active)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Date</label>
                  <Input type="date" value={createDate} onChange={(e) => setCreateDate(e.target.value)} />
                </div>

                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
                    Description
                  </label>
                  <Input
                    value={createDescription}
                    onChange={(e) => setCreateDescription(e.target.value)}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Lines</label>
                  <Button
                    variant="outline"
                    onClick={() =>
                      setCreateLines((prev) => [...prev, { refProduit: '', quantiteReelle: 0, prixHt: 0, dernierPrixAchat: 0 }])
                    }
                  >
                    Add line
                  </Button>
                </div>

                <div className="space-y-2">
                  {createLines.map((l, idx) => (
                    <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                      <div className="md:col-span-5">
                        <label className="text-xs text-muted-foreground">Produit</label>
                        <ProductCombobox
                          value={l.refProduit || null}
                          onChange={(refe, product) => {
                            setCreateLines((prev) =>
                              prev.map((x, i) =>
                                i === idx
                                  ? {
                                      ...x,
                                      refProduit: refe ?? '',
                                      productName: product?.name ?? null,
                                      prixHt: x.prixHt || Number(product?.purchasingPrice ?? 0),
                                      dernierPrixAchat: x.dernierPrixAchat || Number(product?.purchasingPrice ?? 0),
                                    }
                                  : x
                              )
                            );
                          }}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-xs text-muted-foreground">Qté réelle</label>
                        <Input
                          type="number"
                          value={String(l.quantiteReelle)}
                          onChange={(e) => {
                            const v = Number(e.target.value);
                            setCreateLines((prev) => prev.map((x, i) => (i === idx ? { ...x, quantiteReelle: v } : x)));
                          }}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-xs text-muted-foreground">Prix HT</label>
                        <Input
                          type="number"
                          value={String(l.prixHt)}
                          onChange={(e) => {
                            const v = Number(e.target.value);
                            setCreateLines((prev) => prev.map((x, i) => (i === idx ? { ...x, prixHt: v } : x)));
                          }}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-xs text-muted-foreground">Dernier prix achat</label>
                        <Input
                          type="number"
                          value={String(l.dernierPrixAchat)}
                          onChange={(e) => {
                            const v = Number(e.target.value);
                            setCreateLines((prev) => prev.map((x, i) => (i === idx ? { ...x, dernierPrixAchat: v } : x)));
                          }}
                        />
                      </div>
                      <div className="md:col-span-1 flex justify-end">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setCreateLines((prev) => prev.filter((_, i) => i !== idx))}
                          disabled={createLines.length <= 1}
                          title="Remove line"
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => void doCreate()} disabled={!canCreate}>
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Button variant="outline" onClick={() => void load()} disabled={loading}>
          Refresh
        </Button>
        <Button onClick={() => void exportAllLines()} disabled={loading || rows.length === 0}>
          Export lines (Excel)
        </Button>
      </div>

      <DataTable
        title="Inventories"
        description="Inventaires list"
        data={rows as any}
        columns={columns as any}
        loading={loading}
      />
    </div>
  );
}
