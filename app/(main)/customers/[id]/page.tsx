'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getCustomerById, type Customer } from '@/lib/api/customers';

export default function ViewCustomerPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = useMemo(() => Number(params.id), [params.id]);

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const c = await getCustomerById(id);
        if (cancelled) return;
        setCustomer(c);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load customer');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (Number.isFinite(id)) void load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Customer</h1>
          <p className="text-muted-foreground mt-2">View customer details.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/customers')}>
            Back
          </Button>
          <Button onClick={() => router.push(`/customers/${id}/edit`)} disabled={!customer}>
            Edit
          </Button>
        </div>
      </div>

      {error ? (
        <Card className="p-4 border-border">
          <div className="text-sm text-red-600">{error}</div>
        </Card>
      ) : null}

      <Card className="p-6 border-border">
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading...</div>
        ) : customer ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div><span className="text-muted-foreground">Name:</span> <span className="text-foreground font-medium">{customer.name ?? '-'}</span></div>
            <div><span className="text-muted-foreground">Phone:</span> <span className="text-foreground font-medium">{customer.tel ?? '-'}</span></div>
            <div><span className="text-muted-foreground">Email:</span> <span className="text-foreground font-medium">{customer.mail ?? '-'}</span></div>
            <div><span className="text-muted-foreground">Address:</span> <span className="text-foreground font-medium">{customer.adresse ?? '-'}</span></div>
            <div><span className="text-muted-foreground">Matricule:</span> <span className="text-foreground font-medium">{customer.matricule ?? '-'}</span></div>
            <div><span className="text-muted-foreground">Code:</span> <span className="text-foreground font-medium">{customer.code ?? '-'}</span></div>
            <div><span className="text-muted-foreground">CodeCat:</span> <span className="text-foreground font-medium">{customer.codeCat ?? '-'}</span></div>
            <div><span className="text-muted-foreground">ETB SEC:</span> <span className="text-foreground font-medium">{customer.etbSec ?? '-'}</span></div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">Not found.</div>
        )}
      </Card>
    </div>
  );
}

