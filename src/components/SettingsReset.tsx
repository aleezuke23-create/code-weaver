import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { AlertTriangle, Trash2, Smartphone } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { getDeviceFingerprint } from '@/hooks/useDeviceFingerprint';

interface SettingsResetProps {
  onResetData: () => void;
}

export function SettingsReset({ onResetData }: SettingsResetProps) {
  const [open, setOpen] = useState(false);
  const deviceId = getDeviceFingerprint();

  const handleReset = () => {
    // Clear all localStorage data
    localStorage.removeItem('barber-services');
    localStorage.removeItem('barber-barbers');
    localStorage.removeItem('barber-appointments');
    localStorage.removeItem('barber-cuts');
    localStorage.removeItem('barber-transactions');
    localStorage.removeItem('barber-bills');
    localStorage.removeItem('barber-fiados');
    localStorage.removeItem('barber-monthly-plans');
    
    setOpen(false);
    onResetData();
    
    toast({
      title: "Dados resetados!",
      description: "Todos os dados foram apagados. Recarregue a página.",
    });

    // Reload the page to reset state
    window.location.reload();
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-card-foreground flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-destructive" />
          Zona de Perigo
        </CardTitle>
        <CardDescription>
          Ações que afetam permanentemente seus dados
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-accent rounded-lg">
          <div className="flex items-center gap-3">
            <Smartphone className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium text-card-foreground">Dispositivo atual</p>
              <p className="text-xs text-muted-foreground">ID: {deviceId}</p>
            </div>
          </div>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive" className="w-full gap-2">
              <Trash2 className="w-4 h-4" />
              Resetar Todos os Dados
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card">
            <DialogHeader>
              <DialogTitle className="text-card-foreground flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                Confirmar Reset
              </DialogTitle>
              <DialogDescription>
                Esta ação irá apagar permanentemente todos os seus dados:
              </DialogDescription>
            </DialogHeader>
            
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 my-4">
              <li>Todos os cortes registrados</li>
              <li>Todos os agendamentos</li>
              <li>Todos os fiados</li>
              <li>Todas as mensalidades</li>
              <li>Todas as transações</li>
              <li>Todas as contas</li>
              <li>Serviços personalizados</li>
              <li>Barbeiros adicionados</li>
            </ul>

            <p className="text-sm font-medium text-destructive">
              Esta ação não pode ser desfeita!
            </p>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleReset}>
                Sim, Apagar Tudo
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
