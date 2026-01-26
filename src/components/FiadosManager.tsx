import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Check, CreditCard, Phone, User } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Fiado, FiadoEntry } from '@/types/barber';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FiadosManagerProps {
  fiados: Fiado[];
  onAddFiado: (fiado: Fiado) => void;
  onUpdateFiado: (fiado: Fiado) => void;
  onDeleteFiado: (id: string) => void;
}

export const FiadosManager = ({
  fiados,
  onAddFiado,
  onUpdateFiado,
  onDeleteFiado,
}: FiadosManagerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAddingMore, setIsAddingMore] = useState<string | null>(null);
  const [newFiado, setNewFiado] = useState({
    clientName: '',
    clientPhone: '',
    amount: '',
    description: '',
  });
  const [additionalAmount, setAdditionalAmount] = useState({
    amount: '',
    description: '',
  });

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "dd 'de' MMMM", { locale: ptBR });
  };

  const handleAddFiado = () => {
    if (!newFiado.clientName || !newFiado.amount) return;

    const now = new Date().toISOString();
    const entry: FiadoEntry = {
      id: Date.now().toString(),
      amount: parseFloat(newFiado.amount),
      description: newFiado.description || 'Fiado',
      createdAt: now,
      paid: false,
    };

    const fiado: Fiado = {
      id: Date.now().toString(),
      clientName: newFiado.clientName.trim(),
      clientPhone: newFiado.clientPhone.trim() || undefined,
      entries: [entry],
      createdAt: now,
    };

    onAddFiado(fiado);
    setNewFiado({ clientName: '', clientPhone: '', amount: '', description: '' });
    setIsOpen(false);
  };

  const handleAddMoreToFiado = (fiadoId: string) => {
    if (!additionalAmount.amount) return;

    const fiado = fiados.find(f => f.id === fiadoId);
    if (!fiado) return;

    const now = new Date().toISOString();
    const newEntry: FiadoEntry = {
      id: Date.now().toString(),
      amount: parseFloat(additionalAmount.amount),
      description: additionalAmount.description || 'Fiado adicional',
      createdAt: now,
      paid: false,
    };

    onUpdateFiado({
      ...fiado,
      entries: [...fiado.entries, newEntry],
    });

    setAdditionalAmount({ amount: '', description: '' });
    setIsAddingMore(null);
  };

  const handleConfirmPayment = (fiadoId: string, entryId: string) => {
    const fiado = fiados.find(f => f.id === fiadoId);
    if (!fiado) return;

    const updatedEntries = fiado.entries.map(entry =>
      entry.id === entryId
        ? { ...entry, paid: true, paidAt: new Date().toISOString() }
        : entry
    );

    onUpdateFiado({
      ...fiado,
      entries: updatedEntries,
    });
  };

  const handleDeleteEntry = (fiadoId: string, entryId: string) => {
    const fiado = fiados.find(f => f.id === fiadoId);
    if (!fiado) return;

    const updatedEntries = fiado.entries.filter(entry => entry.id !== entryId);

    if (updatedEntries.length === 0) {
      onDeleteFiado(fiadoId);
    } else {
      onUpdateFiado({
        ...fiado,
        entries: updatedEntries,
      });
    }
  };

  const getTotalPending = (fiado: Fiado) => {
    return fiado.entries
      .filter(e => !e.paid)
      .reduce((sum, e) => sum + e.amount, 0);
  };

  const getTotalPaid = (fiado: Fiado) => {
    return fiado.entries
      .filter(e => e.paid)
      .reduce((sum, e) => sum + e.amount, 0);
  };

  const totalPendingAll = fiados.reduce((sum, f) => sum + getTotalPending(f), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-card-foreground">Fiados</h2>
          <p className="text-muted-foreground">
            Total pendente: <span className="text-destructive font-semibold">R$ {totalPendingAll.toFixed(2)}</span>
          </p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Fiado
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card">
            <DialogHeader>
              <DialogTitle>Adicionar Fiado</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">Nome do Cliente *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="clientName"
                    placeholder="Nome do cliente"
                    value={newFiado.clientName}
                    onChange={(e) => setNewFiado(prev => ({ ...prev, clientName: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientPhone">Telefone (opcional)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="clientPhone"
                    placeholder="(00) 00000-0000"
                    value={newFiado.clientPhone}
                    onChange={(e) => setNewFiado(prev => ({ ...prev, clientPhone: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Valor *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={newFiado.amount}
                    onChange={(e) => setNewFiado(prev => ({ ...prev, amount: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição (opcional)</Label>
                <Input
                  id="description"
                  placeholder="Ex: Corte + Barba"
                  value={newFiado.description}
                  onChange={(e) => setNewFiado(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <Button 
                onClick={handleAddFiado} 
                className="w-full"
                disabled={!newFiado.clientName || !newFiado.amount}
              >
                Adicionar Fiado
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {fiados.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CreditCard className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum fiado registrado</p>
          </CardContent>
        </Card>
      ) : (
        <Accordion type="single" collapsible className="space-y-4">
          {fiados.map((fiado) => {
            const pendingAmount = getTotalPending(fiado);
            const paidAmount = getTotalPaid(fiado);
            const hasPending = pendingAmount > 0;

            return (
              <AccordionItem 
                key={fiado.id} 
                value={fiado.id}
                className="border rounded-lg bg-card"
              >
                <AccordionTrigger className="px-4 hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-primary/10">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold">{fiado.clientName}</p>
                        {fiado.clientPhone && (
                          <p className="text-sm text-muted-foreground">{fiado.clientPhone}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {hasPending && (
                        <Badge variant="destructive">
                          Pendente: R$ {pendingAmount.toFixed(2)}
                        </Badge>
                      )}
                      {paidAmount > 0 && (
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          Pago: R$ {paidAmount.toFixed(2)}
                        </Badge>
                      )}
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Cliente desde: {formatDate(fiado.createdAt)}
                    </p>

                    {fiado.entries.map((entry) => (
                      <div 
                        key={entry.id} 
                        className={`p-3 rounded-lg border ${entry.paid ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">R$ {entry.amount.toFixed(2)}</span>
                              <Badge variant={entry.paid ? 'secondary' : 'destructive'} className={entry.paid ? 'bg-green-100 text-green-700' : ''}>
                                {entry.paid ? 'Pago' : 'Pendente'}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{entry.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Adicionado: {formatDateTime(entry.createdAt)}
                            </p>
                            {entry.paid && entry.paidAt && (
                              <p className="text-xs text-green-600 mt-1">
                                ✓ Pago em: {formatDateTime(entry.paidAt)}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {!entry.paid && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="bg-green-100 hover:bg-green-200 text-green-700 border-green-300"
                                onClick={() => handleConfirmPayment(fiado.id, entry.id)}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive hover:bg-destructive/10"
                              onClick={() => handleDeleteEntry(fiado.id, entry.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {isAddingMore === fiado.id ? (
                      <div className="p-3 border rounded-lg space-y-3 bg-muted/50">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor={`add-amount-${fiado.id}`}>Valor *</Label>
                            <div className="relative mt-1">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
                              <Input
                                id={`add-amount-${fiado.id}`}
                                type="number"
                                step="0.01"
                                placeholder="0,00"
                                value={additionalAmount.amount}
                                onChange={(e) => setAdditionalAmount(prev => ({ ...prev, amount: e.target.value }))}
                                className="pl-10"
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor={`add-desc-${fiado.id}`}>Descrição</Label>
                            <Input
                              id={`add-desc-${fiado.id}`}
                              placeholder="Ex: Corte"
                              value={additionalAmount.description}
                              onChange={(e) => setAdditionalAmount(prev => ({ ...prev, description: e.target.value }))}
                              className="mt-1"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleAddMoreToFiado(fiado.id)}
                            disabled={!additionalAmount.amount}
                          >
                            Adicionar
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setIsAddingMore(null);
                              setAdditionalAmount({ amount: '', description: '' });
                            }}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsAddingMore(fiado.id)}
                        className="w-full"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar mais fiado
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-destructive hover:bg-destructive/10"
                      onClick={() => onDeleteFiado(fiado.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Excluir cliente
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}
    </div>
  );
};
