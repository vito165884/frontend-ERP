'use client';

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, Lock, Unlock } from 'lucide-react';
import { authService } from '@/lib/auth';

interface AccountingYear {
  id: string;
  year: number;
  startDate: string;
  endDate: string;
  status: 'open' | 'closed' | 'locked';
  transactions: number;
}

const mockAccountingYears: AccountingYear[] = [
  {
    id: 'AY-2024',
    year: 2024,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    status: 'open',
    transactions: 1450,
  },
  {
    id: 'AY-2023',
    year: 2023,
    startDate: '2023-01-01',
    endDate: '2023-12-31',
    status: 'closed',
    transactions: 2130,
  },
  {
    id: 'AY-2022',
    year: 2022,
    startDate: '2022-01-01',
    endDate: '2022-12-31',
    status: 'locked',
    transactions: 1890,
  },
];

export default function AccountingYearsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [years, setYears] = useState<AccountingYear[]>(mockAccountingYears);
  const selected = useMemo(() => authService.getAccountingYear(), []);
  const next = searchParams.get('next') || '/dashboard';

  const statusColors = {
    open: 'bg-green-500/10 text-green-600 dark:text-green-400',
    closed: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
    locked: 'bg-red-500/10 text-red-600 dark:text-red-400',
  };

  const statusIcons = {
    open: '🔓',
    closed: '⏸',
    locked: '🔒',
  };

  return (
    <div className="space-y-8 p-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Accounting Years</h1>
          <p className="text-muted-foreground mt-2">
            Configure and manage fiscal year periods for accounting.
          </p>
          {selected ? (
            <p className="text-sm text-muted-foreground mt-2">
              Selected year: <span className="font-semibold text-foreground">{selected}</span>
            </p>
          ) : (
            <p className="text-sm text-muted-foreground mt-2">
              No year selected. Select an open year to continue.
            </p>
          )}
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          Create New Year
        </Button>
      </div>

      <Card className="p-6 border-border">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Year Overview</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Active and archived accounting periods
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-muted/30 border border-border">
            <p className="text-xs font-medium text-muted-foreground uppercase">
              Total Years
            </p>
            <p className="text-2xl font-bold text-foreground mt-2">
              {years.length}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-muted/30 border border-border">
            <p className="text-xs font-medium text-muted-foreground uppercase">
              Current Year
            </p>
            <p className="text-2xl font-bold text-foreground mt-2">
              {new Date().getFullYear()}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-muted/30 border border-border">
            <p className="text-xs font-medium text-muted-foreground uppercase">
              Total Transactions
            </p>
            <p className="text-2xl font-bold text-foreground mt-2">
              {years.reduce((sum, y) => sum + y.transactions, 0).toLocaleString()}
            </p>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        {years.map((year) => (
          <Card key={year.id} className="border-border">
            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-foreground">
                      {year.year}
                    </h3>
                    <Badge className={statusColors[year.status]}>
                      {statusIcons[year.status]} {year.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Start Date</p>
                      <p className="font-semibold text-foreground">
                        {new Date(year.startDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">End Date</p>
                      <p className="font-semibold text-foreground">
                        {new Date(year.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Days</p>
                      <p className="font-semibold text-foreground">
                        {Math.ceil(
                          (new Date(year.endDate).getTime() -
                            new Date(year.startDate).getTime()) /
                            (1000 * 60 * 60 * 24)
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Transactions
                      </p>
                      <p className="font-semibold text-foreground">
                        {year.transactions}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <Button
                    variant={selected === String(year.year) ? 'default' : 'outline'}
                    className="h-10"
                    disabled={year.status !== 'open'}
                    title={year.status !== 'open' ? 'Only open years can be selected' : 'Select this year'}
                    onClick={() => {
                      authService.setAccountingYear(String(year.year));
                      router.replace(next);
                    }}
                  >
                    {selected === String(year.year) ? 'Selected' : 'Select'}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10"
                    title={year.status === 'locked' ? 'Unlock' : 'Lock'}
                  >
                    {year.status === 'locked' ? (
                      <Unlock className="h-4 w-4" />
                    ) : (
                      <Lock className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
