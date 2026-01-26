import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CutRecord, Service, Transaction } from '@/types/barber';
import { TrendingUp, Scissors, DollarSign, Calendar } from 'lucide-react';

interface MonthlyAnalysisProps {
  cuts: CutRecord[];
  services: Service[];
  transactions: Transaction[];
}

export function MonthlyAnalysis({ cuts, services, transactions }: MonthlyAnalysisProps) {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const years = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - i);

  const monthCuts = cuts.filter(cut => {
    const cutDate = new Date(cut.date);
    return cutDate.getMonth() === selectedMonth && cutDate.getFullYear() === selectedYear;
  });

  const monthTransactions = transactions.filter(t => {
    const tDate = new Date(t.date);
    return tDate.getMonth() === selectedMonth && tDate.getFullYear() === selectedYear;
  });

  const totalRevenue = monthCuts.reduce((sum, cut) => sum + cut.total, 0);
  const totalCuts = monthCuts.length;
  const totalIncome = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const netProfit = totalIncome - totalExpenses;

  const serviceCount: Record<string, number> = {};
  monthCuts.forEach(cut => {
    cut.services.forEach(serviceId => {
      serviceCount[serviceId] = (serviceCount[serviceId] || 0) + 1;
    });
  });

  const dayRevenue: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  monthCuts.forEach(cut => {
    const day = new Date(cut.date).getDay();
    dayRevenue[day] += cut.total;
  });

  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const maxDayRevenue = Math.max(...Object.values(dayRevenue), 1);

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-card-foreground flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Análise Mensal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(parseInt(v))}>
              <SelectTrigger className="w-[180px] bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                {months.map((month, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
              <SelectTrigger className="w-[120px] bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                {years.map(year => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <DollarSign className="w-4 h-4" />
              Faturamento Cortes
            </div>
            <p className="text-2xl font-bold text-primary mt-1">
              R$ {totalRevenue.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Scissors className="w-4 h-4" />
              Total de Cortes
            </div>
            <p className="text-2xl font-bold text-card-foreground mt-1">
              {totalCuts}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <TrendingUp className="w-4 h-4" />
              Lucro Líquido
            </div>
            <p className={`text-2xl font-bold mt-1 ${netProfit >= 0 ? 'text-green-600' : 'text-destructive'}`}>
              R$ {netProfit.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <DollarSign className="w-4 h-4" />
              Ticket Médio
            </div>
            <p className="text-2xl font-bold text-card-foreground mt-1">
              R$ {totalCuts > 0 ? (totalRevenue / totalCuts).toFixed(2) : '0.00'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-card-foreground">Serviços Mais Realizados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {services.map(service => {
              const count = serviceCount[service.id] || 0;
              const maxCount = Math.max(...Object.values(serviceCount), 1);
              const percentage = (count / maxCount) * 100;

              return (
                <div key={service.id} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-card-foreground">{service.icon} {service.name}</span>
                    <span className="text-muted-foreground">{count}x - R$ {(count * service.price).toFixed(2)}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-card-foreground">Faturamento por Dia da Semana</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between gap-2 h-40">
            {dayNames.map((day, index) => {
              const revenue = dayRevenue[index];
              const height = (revenue / maxDayRevenue) * 100;

              return (
                <div key={day} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex flex-col items-center justify-end h-28">
                    <span className="text-xs text-muted-foreground mb-1">
                      R$ {revenue.toFixed(0)}
                    </span>
                    <div
                      className="w-full bg-primary rounded-t transition-all duration-300"
                      style={{ height: `${Math.max(height, 4)}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-card-foreground">{day}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
