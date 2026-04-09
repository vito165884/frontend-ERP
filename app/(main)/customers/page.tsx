'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { deleteCustomer, getCustomers, type Customer } from '@/lib/api/customers';

const columns: Column<Customer>[] = [
  { key: 'name', label: 'Customer Name', sortable: true, width: '240px' },
  {
    key: 'tel',
    label: 'Customer Phone',
    sortable: true,
    render: (value) => <span className="text-foreground">{value ?? '-'}</span>,
  },
  {
    key: 'mail',
    label: 'Customer Email',
    sortable: true,
    render: (value) => (
      <span className="text-muted-foreground">{value ?? '-'}</span>
    ),
  },
];

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const resp = await getCustomers({ pageNumber: 1, pageSize: 50 });
        if (cancelled) return;
        setCustomers(resp.items ?? []);
        setFilteredCustomers(resp.items ?? []);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load customers');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const customersCount = useMemo(() => customers.length, [customers]);

  const handleSearch = (searchTerm: string) => {
    const t = searchTerm.trim().toLowerCase();
    const filtered = customers.filter(
      (c) =>
        (c.name ?? '').toLowerCase().includes(t) ||
        (c.mail ?? '').toLowerCase().includes(t) ||
        (c.tel ?? '').toLowerCase().includes(t)
    );
    setFilteredCustomers(filtered);
  };

  return (
    <div className="page-content bg-black">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="page-header border-l-4 border-l-blue-500 pl-5 flex-1">
          <h1 className="page-title">Customers</h1>
          <p className="page-subtitle">
            Manage your customer accounts and relationships.
          </p>
        </div>
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
                  onClick={() => router.push(`/customers/${row.id}`)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  title="Edit"
                  className="hover:bg-blue-600/20 hover:text-blue-400 hover:border-blue-500/50"
                  onClick={() => router.push(`/customers/${row.id}/edit`)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  title="Delete"
                  className="text-red-600 hover:text-red-500 hover:bg-red-600/20 hover:border-red-500/50"
                  onClick={async () => {
                    if (!confirm('Delete this customer?')) return;
                    await deleteCustomer(row.id);
                    setCustomers((prev) => prev.filter((c) => c.id !== row.id));
                    setFilteredCustomers((prev) => prev.filter((c) => c.id !== row.id));
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ),
          } as Column<Customer>,
        ]}
        data={filteredCustomers}
        title="Customer List"
        description="View and manage all customer accounts"
        searchPlaceholder="Search by name, email, or phone..."
        onSearchChange={handleSearch}
        onAddClick={() => router.push('/customers/create')}
      />

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading...</div>
      ) : null}
    </div>
  );
}
