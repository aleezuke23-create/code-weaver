import { Card, CardContent } from '@/components/ui/card';
import { CutRecord, Service } from '@/types/barber';
import { Scissors, DollarSign, TrendingUp, Users } from 'lucide-react';

interface DashboardStatsProps {
  cuts: CutRecord[];
  services: Service[];
  selectedDate: string;
}

export function DashboardStats({ cuts, services, selectedDate }: DashboardStatsProps) {
  const todayCuts = cuts.filter(cut => cut.date === selectedDate);

  const totalEarnings = todayCuts.reduce((sum, cut) => sum + cut.total, 0);
  const totalCuts = todayCuts.length;

  const serviceCount = todayCuts.reduce((acc, cut) => {
    cut.services.forEach(serviceId => {
      acc[serviceId] = (acc[serviceId] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const stats = [
    {
      label: 'Cortes Hoje',
      value: totalCuts,
      icon: Scissors,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: 'Faturamento',
      value: `R$ ${totalEarnings.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-green-600',
      bg: 'bg-green-100',
    },
    {
      label: 'Média por Corte',
      value: `R$ ${totalCuts > 0 ? (totalEarnings / totalCuts).toFixed(2) : '0.00'}`,
      icon: TrendingUp,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      label: 'Clientes',
      value: todayCuts.filter(c => c.clientName).length,
      icon: Users,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-border bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-xl font-bold text-card-foreground">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {Object.keys(serviceCount).length > 0 && (
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-muted-foreground mb-3">Serviços Realizados Hoje</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(serviceCount).map(([serviceId, count]) => {
                const service = services.find(s => s.id === serviceId);
                if (!service) return null;
                return (
                  <div
                    key={serviceId}
                    className="flex items-center gap-2 bg-accent px-3 py-1.5 rounded-full"
                  >
                    <span>{service.icon}</span>
                    <span className="text-sm font-medium text-accent-foreground">{service.name}</span>
                    <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
