import { useState } from 'react';
import { Bill } from '@/types/barber';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { format, isBefore, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface BillsManagerProps {
  bills: Bill[];
  onAddBill: (bill: Bill) => void;
  onUpdateBill: (bill: Bill) => void;
  onDeleteBill: (id: string) => void;
}

export function BillsManager({ bills, onAddBill, onUpdateBill, onDeleteBill }: BillsManagerProps) {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = () => {
    if (!description || !amount || !dueDate) {
      toast({
        title: "Preencha todos os campos",
        variant: "destructive"
      });
      return;
    }

    const newBill: Bill = {
      id: Date.now().toString(),
      description,
      amount: parseFloat(amount),
      dueDate,
      paid: false,
    };

    onAddBill(newBill);
    setOpen(false);
    resetForm();

    toast({
      title: "Conta adicionada!",
    });
  };

  const resetForm = () => {
    setDescription('');
    setAmount('');
    setDueDate('');
  };

  const togglePaid = (bill: Bill) => {
    onUpdateBill({
      ...bill,
      paid: !bill.paid,
      paidAt: !bill.paid ? new Date().toISOString() : undefined,
    });
  };

  const isOverdue = (bill: Bill) => {
    return !bill.paid && isBefore(parseISO(bill.dueDate), new Date());
  };

  const sortedBills = [...bills].sort((a, b) => {
    if (a.paid !== b.paid) return a.paid ? 1 : -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const totalPending = bills.filter(b => !b.paid).reduce((sum, b) => sum + b.amount, 0);
  const totalOverdue = bills.filter(b => isOverdue(b)).reduce((sum, b) => sum + b.amount, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-sm text-yellow-700">A Pagar</p>
                <p className="text-2xl font-bold text-yellow-700">R$ {totalPending.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-sm text-red-700">Vencidas</p>
                <p className="text-2xl font-bold text-red-700">R$ {totalOverdue.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-card-foreground">Contas a Pagar</CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Nova Conta
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card">
              <DialogHeader>
                <DialogTitle className="text-card-foreground">Nova Conta</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ex: Aluguel, Energia..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Valor (R$)</Label>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Vencimento</Label>
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>

                <Button onClick={handleSubmit} className="w-full">
                  Adicionar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            {sortedBills.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma conta cadastrada
              </p>
            ) : (
              <div className="space-y-2">
                {sortedBills.map(bill => (
                  <div
                    key={bill.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      bill.paid
                        ? 'bg-green-50'
                        : isOverdue(bill)
                          ? 'bg-red-50'
                          : 'bg-yellow-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={bill.paid}
                        onCheckedChange={() => togglePaid(bill)}
                      />
                      <div>
                        <p className={`font-medium ${bill.paid ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                          {bill.description}
                        </p>
                        <p className={`text-xs ${
                          bill.paid
                            ? 'text-green-600'
                            : isOverdue(bill)
                              ? 'text-red-600'
                              : 'text-muted-foreground'
                        }`}>
                          {bill.paid
                            ? `Pago em ${format(parseISO(bill.paidAt!), 'dd/MM/yyyy', { locale: ptBR })}`
                            : `Vence em ${format(parseISO(bill.dueDate), 'dd/MM/yyyy', { locale: ptBR })}`
                          }
                          {isOverdue(bill) && ' - VENCIDA'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`font-bold ${
                        bill.paid
                          ? 'text-green-700'
                          : isOverdue(bill)
                            ? 'text-red-700'
                            : 'text-yellow-700'
                      }`}>
                        R$ {bill.amount.toFixed(2)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDeleteBill(bill.id)}
                        className="text-muted-foreground hover:text-destructive"
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
    </div>
  );
}
