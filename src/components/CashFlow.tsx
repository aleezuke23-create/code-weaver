import { useState } from 'react';
import { Transaction } from '@/types/barber';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowUpCircle, ArrowDownCircle, Plus, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CashFlowProps {
  transactions: Transaction[];
  onAddTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  selectedDate: string;
}

const incomeCategories = ['Cortes', 'Produtos', 'Outros'];
const expenseCategories = ['Aluguel', 'Produtos', 'Energia', 'Água', 'Internet', 'Manutenção', 'Outros'];

export function CashFlow({ transactions, onAddTransaction, onDeleteTransaction, selectedDate }: CashFlowProps) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');

  const todayTransactions = transactions.filter(t => t.date === selectedDate);

  const totalIncome = todayTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = todayTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const handleSubmit = () => {
    if (!category || !description || !amount) {
      toast({
        title: "Preencha todos os campos",
        variant: "destructive"
      });
      return;
    }

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type,
      category,
      description,
      amount: parseFloat(amount),
      date: selectedDate,
      createdAt: new Date().toISOString(),
    };

    onAddTransaction(newTransaction);
    setOpen(false);
    resetForm();

    toast({
      title: type === 'income' ? 'Entrada registrada!' : 'Saída registrada!',
    });
  };

  const resetForm = () => {
    setType('income');
    setCategory('');
    setDescription('');
    setAmount('');
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <ArrowUpCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-green-700">Entradas</p>
                <p className="text-2xl font-bold text-green-700">R$ {totalIncome.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <ArrowDownCircle className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-sm text-red-700">Saídas</p>
                <p className="text-2xl font-bold text-red-700">R$ {totalExpense.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-card-foreground">Movimentações</CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Nova
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card">
              <DialogHeader>
                <DialogTitle className="text-card-foreground">Nova Movimentação</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    variant={type === 'income' ? 'default' : 'outline'}
                    onClick={() => setType('income')}
                    className="flex-1 gap-2"
                  >
                    <ArrowUpCircle className="w-4 h-4" />
                    Entrada
                  </Button>
                  <Button
                    variant={type === 'expense' ? 'default' : 'outline'}
                    onClick={() => setType('expense')}
                    className="flex-1 gap-2"
                  >
                    <ArrowDownCircle className="w-4 h-4" />
                    Saída
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      {(type === 'income' ? incomeCategories : expenseCategories).map(cat => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descreva a movimentação"
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

                <Button onClick={handleSubmit} className="w-full">
                  Confirmar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            {todayTransactions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma movimentação hoje
              </p>
            ) : (
              <div className="space-y-2">
                {todayTransactions.map(transaction => (
                  <div
                    key={transaction.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      transaction.type === 'income' ? 'bg-green-50' : 'bg-red-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {transaction.type === 'income' ? (
                        <ArrowUpCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <ArrowDownCircle className="w-5 h-5 text-red-600" />
                      )}
                      <div>
                        <p className="font-medium text-foreground">{transaction.description}</p>
                        <p className="text-xs text-muted-foreground">{transaction.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`font-bold ${
                        transaction.type === 'income' ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'} R$ {transaction.amount.toFixed(2)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDeleteTransaction(transaction.id)}
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
