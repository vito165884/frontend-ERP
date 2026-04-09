'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createCustomer } from '@/lib/api/customers';

export default function CreateCustomerPage() {
  const router = useRouter();
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

  async function onSave() {
    setSaving(true);
    setError(null);
    try {
      if (!nom.trim()) throw new Error('Customer name is required');
      const id = await createCustomer({
        nom: nom.trim(),
        tel: tel.trim(),
        adresse: adresse.trim(),
        matricule: matricule.trim(),
        code: code.trim(),
        codeCat: codeCat.trim(),
        etbSec: etbSec.trim(),
        mail: mail.trim(),
      });
      router.replace(`/customers/${id}`);
    } catch (e: any) {
      setError(e?.message || 'Failed to create customer');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Add Customer</h1>
          <p className="text-muted-foreground mt-2">Create a new customer account.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/customers')}>
            Back
          </Button>
          <Button onClick={onSave} disabled={saving}>
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
      </Card>
    </div>
  );
}

