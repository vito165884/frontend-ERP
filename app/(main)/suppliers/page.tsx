'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { deleteProvider, getProviders, type Provider } from '@/lib/api/providers';

const columns: Column<Provider>[] = [
  {
    key: 'nom',
    label: 'Name',
    sortable: true,
    width: '240px',
    render: (v) => <span className="font-medium text-foreground">{String(v ?? '')}</span>,
  },
  {
    key: 'tel',
    label: 'Phone',
    sortable: true,
    render: (v) => <span className="text-foreground">{v ?? '—'}</span>,
  },
  {
    key: 'mail',
    label: 'Email',
    sortable: true,
    render: (v) => <span className="text-muted-foreground">{v ?? '—'}</span>,
  },
  {
    key: 'matricule',
    label: 'Matricule',
    sortable: true,
    render: (v) => <span className="text-muted-foreground text-sm">{v ?? '—'}</span>,
  },
];

export default function SuppliersPage() {
  const router = useRouter();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [filtered, setFiltered] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const resp = await getProviders({ pageNumber: 1, pageSize: 50 });
        if (cancelled) return;
        setProviders(resp.items ?? []);
        setFiltered(resp.items ?? []);
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load suppliers');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSearch = (searchTerm: string) => {
    const t = searchTerm.trim().toLowerCase();
    setFiltered(
      providers.filter(
        (p) =>
          (p.nom ?? '').toLowerCase().includes(t) ||
          (p.mail ?? '').toLowerCase().includes(t) ||
          (p.tel ?? '').toLowerCase().includes(t) ||
          (p.matricule ?? '').toLowerCase().includes(t) ||
          String(p.id).includes(t)
      )
    );
  };

  const count = useMemo(() => providers.length, [providers]);

  return (
    <div className="page-content bg-black">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="page-header border-l-4 border-l-blue-500 pl-5 flex-1">
          <h1 className="page-title">Suppliers</h1>
          <p className="page-subtitle">
            Provider accounts from GET /providers (same as Razor fournisseurs list).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-6 border-border border-l-4 border-l-blue-500 hover:border-blue-500/60 transition-colors">
          <p className="text-sm font-medium text-blue-400">Loaded</p>
          <p className="text-3xl font-bold text-foreground mt-2">{count}</p>
          <p className="text-xs text-muted-foreground mt-2">First page (max 50)</p>
        </Card>
        <Card className="p-6 border-border border-l-4 border-l-blue-500 hover:border-blue-500/60 transition-colors">
          <p className="text-sm font-medium text-blue-400">Manufacturers</p>
          <p className="text-3xl font-bold text-foreground mt-2">
            {providers.filter((p) => p.constructeur).length}
          </p>
          <p className="text-xs text-muted-foreground mt-2">constructeur = true</p>
        </Card>
      </div>

      {error ? (
        <Card className="p-4 border-border">
          <div className="text-sm text-red-600">{error}</div>
        </Card>
      ) : null}

      <DataTable
        columns={[
          ...columns,
          {
            key: 'id',
            label: 'Actions',
            sortable: false,
            render: (_value, row) => (
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  size="icon"
                  title="View"
                  className="hover:bg-blue-600/20 hover:text-blue-400 hover:border-blue-500/50"
                  onClick={() => router.push(`/suppliers/${row.id}`)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  title="Edit"
                  className="hover:bg-blue-600/20 hover:text-blue-400 hover:border-blue-500/50"
                  onClick={() => router.push(`/suppliers/${row.id}/edit`)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  title="Delete"
                  className="text-red-600 hover:text-red-500 hover:bg-red-600/20 hover:border-red-500/50"
                  onClick={async () => {
                    if (!window.confirm('Delete this supplier?')) return;
                    try {
                      await deleteProvider(row.id);
                      setProviders((prev) => prev.filter((p) => p.id !== row.id));
                      setFiltered((prev) => prev.filter((p) => p.id !== row.id));
                    } catch (e: unknown) {
                      setError(e instanceof Error ? e.message : 'Delete failed');
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ),
          } as Column<Provider>,
        ]}
        data={filtered}
        title="Supplier accounts"
        description="Search and open details or edit"
        searchPlaceholder="Search by name, email, phone, matricule, id…"
        onSearchChange={handleSearch}
        onAddClick={() => router.push('/suppliers/create')}
        loading={loading}
      />
    </div>
  );
}
