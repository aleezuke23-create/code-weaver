import { useState } from 'react';
import { ServiceButton } from './ServiceButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Service, CutRecord, Barber } from '@/types/barber';
import { Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface QuickCutFormProps {
  services: Service[];
  barbers: Barber[];
  currentBarberId: string;
  onAddCut: (cut: CutRecord) => void;
}

export function QuickCutForm({ services, currentBarberId, onAddCut }: QuickCutFormProps) {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [clientName, setClientName] = useState('');

  const toggleService = (serviceId: string) => {
    setSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const calculateTotal = () => {
    return selectedServices.reduce((total, serviceId) => {
      const service = services.find(s => s.id === serviceId);
      return total + (service?.price || 0);
    }, 0);
  };

  const handleSubmit = () => {
    if (selectedServices.length === 0) {
      toast({
        title: "Selecione ao menos um serviço",
        variant: "destructive"
      });
      return;
    }

    const newCut: CutRecord = {
      id: Date.now().toString(),
      barberId: currentBarberId,
      date: new Date().toISOString().split('T')[0],
      services: selectedServices,
      total: calculateTotal(),
      clientName: clientName || undefined,
      createdAt: new Date().toISOString(),
    };

    onAddCut(newCut);
    setSelectedServices([]);
    setClientName('');

    toast({
      title: "Corte registrado!",
      description: `Total: R$ ${calculateTotal().toFixed(2)}`,
    });
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-card-foreground">Registrar Corte Rápido</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="Nome do cliente (opcional)"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          className="bg-background border-input"
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {services.map(service => (
            <ServiceButton
              key={service.id}
              service={service}
              selected={selectedServices.includes(service.id)}
              onToggle={toggleService}
            />
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div>
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold text-primary">R$ {calculateTotal().toFixed(2)}</p>
          </div>
          <Button
            onClick={handleSubmit}
            size="lg"
            className="gap-2"
            disabled={selectedServices.length === 0}
          >
            <Check className="w-5 h-5" />
            Confirmar Corte
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
