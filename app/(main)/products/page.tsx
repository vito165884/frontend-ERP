'use client';

import { useEffect, useMemo, useState } from 'react';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { deleteProductByReference, getProducts, type Product as ApiProduct } from '@/lib/api/products';

type Product = ApiProduct;

const columns = (onDelete: (refe: string) => void): Column<Product>[] => [
  {
    key: 'reference',
    label: 'Ref',
    sortable: true,
    width: '140px',
  },
  {
    key: 'name',
    label: 'Product Name',
    sortable: true,
    width: '240px',
  },
  {
    key: 'sousFamilleProduitNom',
    label: 'Sub-family',
    sortable: true,
  },
  {
    key: 'stockCalcule',
    label: 'Stock',
    sortable: true,
    render: (value) => <span className="font-medium text-foreground">{Number(value ?? 0)}</span>,
  },
  {
    key: 'price',
    label: 'Unit Price',
    sortable: true,
    render: (value) => (
      <span className="font-medium text-foreground">
        ${Number(value).toFixed(2)}
      </span>
    ),
  },
  {
    key: 'visibility',
    label: 'Visible',
    sortable: true,
    render: (value) => <span className="text-muted-foreground">{value ? 'Yes' : 'No'}</span>,
  },
  {
    key: 'isStockLow',
    label: 'Low stock',
    sortable: true,
    render: (value) => (
      <Badge className={value ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400' : 'bg-green-500/10 text-green-600 dark:text-green-400'}>
        {value ? 'Yes' : 'No'}
      </Badge>
    ),
  },
  {
    id: 'actions',
    key: 'reference',
    label: '',
    sortable: false,
    width: '70px',
    render: (value) => (
      <Button variant="ghost" size="icon" onClick={() => onDelete(String(value))} title="Delete">
        <Trash2 className="h-4 w-4" />
      </Button>
    ),
  },
];

export default function ProductsPage() {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');

  async function load(nextSearch?: string) {
    setLoading(true);
    try {
      const res = await getProducts({ pageNumber: 1, pageSize: 50, searchKeyword: nextSearch ?? searchKeyword ?? null });
      setProducts(res.items);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const kpis = useMemo(() => {
    const totalValue = products.reduce((sum, p) => sum + Number(p.stockCalcule ?? 0) * Number(p.price ?? 0), 0);
    const lowStockCount = products.filter((p) => p.isStockLow).length;
    const outOfStockCount = products.filter((p) => Number(p.stockCalcule ?? 0) <= 0).length;
    return { totalValue, lowStockCount, outOfStockCount };
  }, [products]);

  async function onDelete(refe: string) {
    await deleteProductByReference(refe);
    await load();
  }

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Products</h1>
        <p className="text-muted-foreground mt-2">
          Manage your product inventory and stock levels.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-6 border-border">
          <p className="text-sm font-medium text-muted-foreground">Total Products</p>
          <p className="text-3xl font-bold text-foreground mt-2">{products.length}</p>
          <p className="text-xs text-muted-foreground mt-2">
            ${kpis.totalValue.toLocaleString()} inventory value
          </p>
        </Card>
        <Card className="p-6 border-border">
          <p className="text-sm font-medium text-muted-foreground">Low Stock</p>
          <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">
            {kpis.lowStockCount}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Need restocking soon
          </p>
        </Card>
        <Card className="p-6 border-border">
          <p className="text-sm font-medium text-muted-foreground">Out of Stock</p>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">
            {kpis.outOfStockCount}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Immediate restocking needed
          </p>
        </Card>
      </div>

      <DataTable
        columns={columns(onDelete) as any}
        data={products as any}
        title="Product List"
        description="View and manage all products"
        searchPlaceholder="Search by name, SKU, or family..."
        loading={loading}
        onSearchChange={(v) => {
          setSearchKeyword(v);
          void load(v);
        }}
        onAddClick={() => console.log('Add product')}
      />
    </div>
  );
}
