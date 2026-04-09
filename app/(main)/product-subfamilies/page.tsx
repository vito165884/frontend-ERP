'use client';

import { useEffect, useState } from 'react';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getProductFamilies, type ProductFamily } from '@/lib/api/product-families';
import { getProductSubFamilies, type ProductSubFamily } from '@/lib/api/product-subfamilies';

export default function ProductSubFamiliesPage() {
  const [loading, setLoading] = useState(false);
  const [families, setFamilies] = useState<ProductFamily[]>([]);
  const [familyId, setFamilyId] = useState<number | null>(null);
  const [rows, setRows] = useState<ProductSubFamily[]>([]);

  useEffect(() => {
    void (async () => {
      const f = await getProductFamilies();
      setFamilies(f);
    })();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await getProductSubFamilies({ familleProduitId: familyId });
      setRows(res);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [familyId]);

  const columns: Column<ProductSubFamily>[] = [
    { key: 'id', label: 'ID', sortable: true, width: '90px' },
    { key: 'nom', label: 'Name', sortable: true },
    { key: 'familleProduitNom', label: 'Family', sortable: true },
  ];

  return (
    <div className="space-y-8 p-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground">Product Sub-Families</h1>
        <p className="text-muted-foreground text-base">
          Manage product sub-categories within families
        </p>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div className="w-full md:w-[320px]">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Filter by Family</label>
            <select
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={familyId ?? ''}
              onChange={(e) => setFamilyId(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">All Families</option>
              {families.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nom}
                </option>
              ))}
            </select>
          </div>
          <Button variant="outline" onClick={() => void load()} disabled={loading}>
            Refresh
          </Button>
        </div>
      </Card>

      <DataTable
        columns={columns as any}
        data={rows as any}
        title="Sub-Family List"
        description="View and manage all product sub-families"
        loading={loading}
      />
    </div>
  );
}
