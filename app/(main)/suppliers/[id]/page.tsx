'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getProviderById, type Provider } from '@/lib/api/providers';

export default function ViewSupplierPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = useMemo(() => Number(params.id), [params.id]);

  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const p = await getProviderById(id);
        if (cancelled) return;
        setProvider(p);
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load supplier');
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
          <h1 className="text-3xl font-bold text-foreground">Supplier</h1>
          <p className="text-muted-foreground mt-2">GET /providers/{'{id}'}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/suppliers')}>
            Back
          </Button>
          <Button onClick={() => router.push(`/suppliers/${id}/edit`)} disabled={!provider}>
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
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : provider ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Name:</span>{' '}
              <span className="text-foreground font-medium">{provider.nom}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Phone:</span>{' '}
              <span className="text-foreground font-medium">{provider.tel}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Email:</span>{' '}
              <span className="text-foreground font-medium">{provider.mail ?? '—'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Address:</span>{' '}
              <span className="text-foreground font-medium">{provider.adresse ?? '—'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Matricule:</span>{' '}
              <span className="text-foreground font-medium">{provider.matricule ?? '—'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Code:</span>{' '}
              <span className="text-foreground font-medium">{provider.code ?? '—'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Category:</span>{' '}
              <span className="text-foreground font-medium">{provider.codecat ?? '—'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">ETB SEC:</span>{' '}
              <span className="text-foreground font-medium">{provider.etbsec ?? '—'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Manufacturer:</span>{' '}
              <span className="text-foreground font-medium">{provider.constructeur ? 'Yes' : 'No'}</span>
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">Not found.</div>
        )}
      </Card>
    </div>
  );
}
