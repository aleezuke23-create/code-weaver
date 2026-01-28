import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { AlertTriangle, Trash2, LogOut } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { User } from '@supabase/supabase-js';

interface SettingsResetProps {
  user: User | null;
  onResetData: () => void;
}

export function SettingsReset({ user, onResetData }: SettingsResetProps) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: "Você saiu da conta" });
    navigate('/auth');
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
        {user && (
          <div className="flex items-center justify-between p-4 bg-accent rounded-lg">
            <div>
              <p className="font-medium text-card-foreground">Conta conectada</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            <Button variant="outline" onClick={handleLogout} className="gap-2">
              <LogOut className="w-4 h-4" />
              Sair
            </Button>
          </div>
        )}

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
