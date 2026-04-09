'use client';

import { useEffect, useState } from 'react';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { getProductFamilies, type ProductFamily } from '@/lib/api/product-families';

export default function ProductFamiliesPage() {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<ProductFamily[]>([]);

  async function load() {
    setLoading(true);
    try {
      const res = await getProductFamilies();
      setRows(res);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const columns: Column<ProductFamily>[] = [
    { key: 'id', label: 'ID', sortable: true, width: '100px' },
    { key: 'nom', label: 'Name', sortable: true },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-end">
        <Button variant="outline" onClick={() => void load()} disabled={loading}>
          Refresh
        </Button>
      </div>
      <DataTable
        title="Product Families"
        description="Families list"
        data={rows as any}
        columns={columns as any}
        loading={loading}
      />
    </div>
  );
}
