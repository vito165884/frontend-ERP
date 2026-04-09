import { Card } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    direction: 'up' | 'down';
    label: string;
  };
  color?: 'blue' | 'green' | 'orange' | 'red';
}

const colorClasses = {
  blue: 'text-muted-foreground',
  green: 'text-muted-foreground',
  orange: 'text-muted-foreground',
  red: 'text-muted-foreground',
};

export function KPICard({
  title,
  value,
  icon,
  trend,
  color = 'blue',
}: KPICardProps) {
  return (
    <Card className="p-6 hover:border-white/30 hover:bg-white/10 transition-all duration-300">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm text-gray-400 font-semibold tracking-wide uppercase">{title}</p>
          <h3 className="text-5xl font-bold text-white mt-4 leading-none">{value}</h3>
          {trend && (
            <div className="flex items-center gap-2.5 mt-4">
              {trend.direction === 'up' ? (
                <ArrowUpRight className="h-5 w-5 text-green-400" />
              ) : (
                <ArrowDownRight className="h-5 w-5 text-red-400" />
              )}
              <span className={cn(
                'text-sm font-semibold',
                trend.direction === 'up' ? 'text-green-400' : 'text-red-400'
              )}>
                {trend.value}% {trend.label}
              </span>
            </div>
          )}
        </div>
        <div className={cn('flex-shrink-0 h-14 w-14 flex items-center justify-center rounded-xl backdrop-blur-md bg-white/10 border border-white/20', colorClasses[color])}>
          <span className="text-white [&>svg]:h-6 [&>svg]:w-6">{icon}</span>
        </div>
      </div>
    </Card>
  );
}
