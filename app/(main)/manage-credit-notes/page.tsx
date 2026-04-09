'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ManageCreditNotesPage() {
  const router = useRouter();

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold text-foreground">Manage credit notes</h1>
          <p className="text-muted-foreground">Create and modify customer credit notes (avoirs).</p>
        </div>
      </div>

      <Card className="p-6 border-border">
        <div className="flex flex-col gap-4">
          <div className="text-sm text-muted-foreground">
            This matches the Razor “Manage avoirs” entry point.
          </div>
          <div>
            <Button className="gap-2" onClick={() => router.push('/AddOrUpdateAvoir')}>
              <Plus className="h-4 w-4" />
              Add credit note
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

