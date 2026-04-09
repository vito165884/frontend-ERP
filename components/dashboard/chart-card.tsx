import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, RefreshCw } from 'lucide-react';

interface ChartCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export function ChartCard({
  title,
  description,
  children,
  actions,
}: ChartCardProps) {
  return (
    <Card className="p-6 hover:border-white/30 hover:bg-white/10 transition-all duration-300">
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white">{title}</h3>
          {description && (
            <p className="text-base text-gray-400 mt-2 font-medium">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {actions}
          <Button variant="ghost" size="icon" className="h-10 w-10">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </div>
      <div className="w-full h-80 rounded-lg">{children}</div>
    </Card>
  );
}
