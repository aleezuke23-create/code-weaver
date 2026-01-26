import { useState } from 'react';
import { Service } from '@/types/barber';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ServicesManagerProps {
  services: Service[];
  onAddService: (service: Service) => void;
  onUpdateService: (service: Service) => void;
  onDeleteService: (id: string) => void;
}

const emojiOptions = ['✂️', '🧔', '👁️', '💇', '🎨', '💆', '🪮', '💈', '🧴', '✨'];

export function ServicesManager({ services, onAddService, onUpdateService, onDeleteService }: ServicesManagerProps) {
  const [open, setOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [icon, setIcon] = useState('✂️');

  const handleSubmit = () => {
    if (!name || !price) {
      toast({
        title: "Preencha todos os campos",
        variant: "destructive"
      });
      return;
    }

    if (editingService) {
      onUpdateService({
        ...editingService,
        name,
        price: parseFloat(price),
        icon,
      });
      toast({ title: "Serviço atualizado!" });
    } else {
      const newService: Service = {
        id: Date.now().toString(),
        name,
        price: parseFloat(price),
        icon,
      };
      onAddService(newService);
      toast({ title: "Serviço adicionado!" });
    }

    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setEditingService(null);
    setName('');
    setPrice('');
    setIcon('✂️');
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setName(service.name);
    setPrice(service.price.toString());
    setIcon(service.icon);
    setOpen(true);
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-card-foreground">Serviços</CardTitle>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Serviço
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card">
            <DialogHeader>
              <DialogTitle className="text-card-foreground">
                {editingService ? 'Editar Serviço' : 'Novo Serviço'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Corte Degradê"
                />
              </div>

              <div className="space-y-2">
                <Label>Preço (R$)</Label>
                <Input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label>Ícone</Label>
                <div className="flex flex-wrap gap-2">
                  {emojiOptions.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setIcon(emoji)}
                      className={`text-2xl p-2 rounded-lg border-2 transition-all ${
                        icon === emoji
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <Button onClick={handleSubmit} className="w-full">
                {editingService ? 'Salvar' : 'Adicionar'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {services.map(service => (
            <div
              key={service.id}
              className="flex flex-col items-center p-4 bg-accent rounded-lg relative group"
            >
              <span className="text-3xl mb-2">{service.icon}</span>
              <span className="font-medium text-accent-foreground text-center">{service.name}</span>
              <span className="text-primary font-bold">R$ {service.price.toFixed(2)}</span>

              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => handleEdit(service)}
                >
                  <Pencil className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={() => onDeleteService(service.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
