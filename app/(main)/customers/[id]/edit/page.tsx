'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getCustomerById, updateCustomer } from '@/lib/api/customers';

export default function EditCustomerPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = useMemo(() => Number(params.id), [params.id]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [nom, setNom] = useState('');
  const [tel, setTel] = useState('');
  const [mail, setMail] = useState('');
  const [adresse, setAdresse] = useState('');
  const [matricule, setMatricule] = useState('');
  const [code, setCode] = useState('');
  const [codeCat, setCodeCat] = useState('');
  const [etbSec, setEtbSec] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const c = await getCustomerById(id);
        if (cancelled) return;
        setNom(c.name ?? '');
        setTel(c.tel ?? '');
        setMail(c.mail ?? '');
        setAdresse(c.adresse ?? '');
        setMatricule(c.matricule ?? '');
        setCode(c.code ?? '');
        setCodeCat(c.codeCat ?? '');
        setEtbSec(c.etbSec ?? '');
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

  async function onSave() {
    setSaving(true);
    setError(null);
    try {
      if (!nom.trim()) throw new Error('Customer name is required');
      await updateCustomer(id, {
        nom: nom.trim(),
        tel: tel.trim() || null,
        adresse: adresse.trim() || null,
        matricule: matricule.trim() || null,
        code: code.trim() || null,
        codeCat: codeCat.trim() || null,
        etbSec: etbSec.trim() || null,
        mail: mail.trim() || null,
      });
      router.replace(`/customers/${id}`);
    } catch (e: any) {
      setError(e?.message || 'Failed to update customer');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Edit Customer</h1>
          <p className="text-muted-foreground mt-2">Update customer information.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/customers/${id}`)}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={saving || loading}>
            {saving ? 'Saving...' : 'Save'}
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Name</div>
              <Input value={nom} onChange={(e) => setNom(e.target.value)} />
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Phone</div>
              <Input value={tel} onChange={(e) => setTel(e.target.value)} />
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Email</div>
              <Input value={mail} onChange={(e) => setMail(e.target.value)} />
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Address</div>
              <Input value={adresse} onChange={(e) => setAdresse(e.target.value)} />
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Matricule</div>
              <Input value={matricule} onChange={(e) => setMatricule(e.target.value)} />
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Code</div>
              <Input value={code} onChange={(e) => setCode(e.target.value)} />
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Category Code</div>
              <Input value={codeCat} onChange={(e) => setCodeCat(e.target.value)} />
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">ETB SEC</div>
              <Input value={etbSec} onChange={(e) => setEtbSec(e.target.value)} />
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

