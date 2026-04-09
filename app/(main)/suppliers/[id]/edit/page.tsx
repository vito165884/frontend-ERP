'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { getProviderById, updateProvider } from '@/lib/api/providers';

export default function EditSupplierPage() {
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
  const [constructeur, setConstructeur] = useState(false);
  const [exonereRetenueSource, setExonereRetenueSource] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const p = await getProviderById(id);
        if (cancelled) return;
        setNom(p.nom ?? '');
        setTel(p.tel ?? '');
        setMail(p.mail ?? '');
        setAdresse(p.adresse ?? '');
        setMatricule(p.matricule ?? '');
        setCode(p.code ?? '');
        setCodeCat(p.codecat ?? '');
        setEtbSec(p.etbsec ?? '');
        setConstructeur(p.constructeur);
        setExonereRetenueSource(p.exonereRetenueSource);
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

  async function onSave() {
    setSaving(true);
    setError(null);
    try {
      if (!nom.trim()) throw new Error('Name is required');
      if (!tel.trim()) throw new Error('Phone is required');
      await updateProvider(id, {
        nom: nom.trim(),
        tel: tel.trim(),
        mail: mail.trim() || null,
        adresse: adresse.trim() || null,
        matricule: matricule.trim() || null,
        code: code.trim() || null,
        codeCat: codeCat.trim() || null,
        etbSec: etbSec.trim() || null,
        constructeur,
        exonereRetenueSource,
      });
      router.replace(`/suppliers/${id}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to update supplier');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Edit supplier</h1>
          <p className="text-muted-foreground mt-2">PUT /providers/{'{id}'}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/suppliers/${id}`)}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={saving || loading}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>

      {error ? (
        <Card className="p-4 border-border">
          <div className="text-sm text-red-600">{error}</div>
        </Card>
      ) : null}

      <Card className="p-6 border-border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Name *</div>
            <Input value={nom} onChange={(e) => setNom(e.target.value)} disabled={loading} />
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Phone *</div>
            <Input value={tel} onChange={(e) => setTel(e.target.value)} disabled={loading} />
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Email</div>
            <Input value={mail} onChange={(e) => setMail(e.target.value)} disabled={loading} />
          </div>
          <div className="space-y-1 md:col-span-2">
            <div className="text-sm text-muted-foreground">Address</div>
            <Input value={adresse} onChange={(e) => setAdresse(e.target.value)} disabled={loading} />
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Matricule</div>
            <Input value={matricule} onChange={(e) => setMatricule(e.target.value)} disabled={loading} />
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Code</div>
            <Input value={code} onChange={(e) => setCode(e.target.value)} disabled={loading} />
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Category code</div>
            <Input value={codeCat} onChange={(e) => setCodeCat(e.target.value)} disabled={loading} />
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">ETB SEC</div>
            <Input value={etbSec} onChange={(e) => setEtbSec(e.target.value)} disabled={loading} />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-3 md:col-span-2">
            <div>
              <div className="text-sm font-medium">Manufacturer</div>
              <div className="text-xs text-muted-foreground">constructeur</div>
            </div>
            <Switch checked={constructeur} onCheckedChange={setConstructeur} disabled={loading} />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-3 md:col-span-2">
            <div>
              <div className="text-sm font-medium">Exempt withholding (exonéré retenue)</div>
            </div>
            <Switch checked={exonereRetenueSource} onCheckedChange={setExonereRetenueSource} disabled={loading} />
          </div>
        </div>
      </Card>
    </div>
  );
}
