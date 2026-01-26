import { CutRecord, Service } from '@/types/barber';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CutHistoryProps {
  cuts: CutRecord[];
  services: Service[];
  selectedDate: string;
  onDeleteCut: (cutId: string) => void;
}

export function CutHistory({ cuts, services, selectedDate, onDeleteCut }: CutHistoryProps) {
  const todayCuts = cuts
    .filter(cut => cut.date === selectedDate)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-card-foreground">Histórico do Dia</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          {todayCuts.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhum corte registrado hoje
            </p>
          ) : (
            <div className="space-y-3">
              {todayCuts.map((cut) => (
                <div
                  key={cut.id}
                  className="flex items-center justify-between p-3 bg-accent rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {formatTime(cut.createdAt)}
                      </span>
                      {cut.clientName && (
                        <span className="text-sm font-medium text-accent-foreground">
                          • {cut.clientName}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {cut.services.map(serviceId => {
                        const service = services.find(s => s.id === serviceId);
                        return service ? (
                          <span
                            key={serviceId}
                            className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded"
                          >
                            {service.icon} {service.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-primary">
                      R$ {cut.total.toFixed(2)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeleteCut(cut.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
