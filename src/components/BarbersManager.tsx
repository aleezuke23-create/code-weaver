import { useState } from 'react';
import { Barber } from '@/types/barber';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface BarbersManagerProps {
  barbers: Barber[];
  onAddBarber: (barber: Barber) => void;
  onUpdateBarber: (barber: Barber) => void;
  onDeleteBarber: (id: string) => void;
}

export function BarbersManager({ barbers, onAddBarber, onUpdateBarber, onDeleteBarber }: BarbersManagerProps) {
  const [open, setOpen] = useState(false);
  const [editingBarber, setEditingBarber] = useState<Barber | null>(null);
  const [name, setName] = useState('');

  const handleSubmit = () => {
    if (!name) {
      toast({
        title: "Preencha o nome",
        variant: "destructive"
      });
      return;
    }

    if (editingBarber) {
      onUpdateBarber({
        ...editingBarber,
        name,
      });
      toast({ title: "Barbeiro atualizado!" });
    } else {
      const newBarber: Barber = {
        id: Date.now().toString(),
        name,
      };
      onAddBarber(newBarber);
      toast({ title: "Barbeiro adicionado!" });
    }

    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setEditingBarber(null);
    setName('');
  };

  const handleEdit = (barber: Barber) => {
    setEditingBarber(barber);
    setName(barber.name);
    setOpen(true);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-card-foreground">Barbeiros</CardTitle>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Barbeiro
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card">
            <DialogHeader>
              <DialogTitle className="text-card-foreground">
                {editingBarber ? 'Editar Barbeiro' : 'Novo Barbeiro'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nome do barbeiro"
                />
              </div>

              <Button onClick={handleSubmit} className="w-full">
                {editingBarber ? 'Salvar' : 'Adicionar'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4">
          {barbers.map(barber => (
            <div
              key={barber.id}
              className="flex items-center gap-3 p-3 bg-accent rounded-lg relative group"
            >
              <Avatar>
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getInitials(barber.name)}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium text-accent-foreground">{barber.name}</span>

              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => handleEdit(barber)}
                >
                  <Pencil className="w-3 h-3" />
                </Button>
                {barbers.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => onDeleteBarber(barber.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
