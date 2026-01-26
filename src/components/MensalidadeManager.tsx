import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { ServiceButton } from '@/components/ServiceButton';
import { MonthlyPlan, Service } from '@/types/barber';
import { Plus, Trash2, Calendar, DollarSign, Check, User, Phone, CalendarCheck } from 'lucide-react';

interface MensalidadeManagerProps {
  plans: MonthlyPlan[];
  services: Service[];
  onAddPlan: (plan: MonthlyPlan) => void;
  onUpdatePlan: (plan: MonthlyPlan) => void;
  onDeletePlan: (id: string) => void;
}

const dayOfWeekNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function MensalidadeManager({
  plans,
  services,
  onAddPlan,
  onUpdatePlan,
  onDeletePlan,
}: MensalidadeManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAttendanceDialogOpen, setIsAttendanceDialogOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  
  const [newPlan, setNewPlan] = useState({
    clientName: '',
    clientPhone: '',
    monthlyPrice: '',
    discountPercentage: '',
    allowedDays: [] as number[],
  });

  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceServices, setAttendanceServices] = useState<string[]>([]);

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const resetNewPlan = () => {
    setNewPlan({
      clientName: '',
      clientPhone: '',
      monthlyPrice: '',
      discountPercentage: '',
      allowedDays: [],
    });
  };

  const handleAddPlan = () => {
    if (!newPlan.clientName.trim()) return;

    const plan: MonthlyPlan = {
      id: Date.now().toString(),
      clientName: newPlan.clientName.trim(),
      clientPhone: newPlan.clientPhone.trim() || undefined,
      monthlyPrice: parseFloat(newPlan.monthlyPrice) || 0,
      discountPercentage: parseFloat(newPlan.discountPercentage) || undefined,
      allowedDays: newPlan.allowedDays,
      attendedDays: [],
      createdAt: new Date().toISOString(),
      active: true,
    };

    onAddPlan(plan);
    resetNewPlan();
    setIsDialogOpen(false);
  };

  const handleToggleDay = (day: number) => {
    setNewPlan(prev => ({
      ...prev,
      allowedDays: prev.allowedDays.includes(day)
        ? prev.allowedDays.filter(d => d !== day)
        : [...prev.allowedDays, day],
    }));
  };

  const handleToggleService = (serviceId: string) => {
    setAttendanceServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleAddAttendance = () => {
    if (!selectedPlanId || attendanceServices.length === 0) return;

    const plan = plans.find(p => p.id === selectedPlanId);
    if (!plan) return;

    const updatedPlan: MonthlyPlan = {
      ...plan,
      attendedDays: [
        ...plan.attendedDays,
        { date: attendanceDate, serviceIds: attendanceServices },
      ],
    };

    onUpdatePlan(updatedPlan);
    setAttendanceServices([]);
    setIsAttendanceDialogOpen(false);
  };

  const openAttendanceDialog = (planId: string) => {
    setSelectedPlanId(planId);
    setAttendanceDate(new Date().toISOString().split('T')[0]);
    setAttendanceServices([]);
    setIsAttendanceDialogOpen(true);
  };

  const calculateMonthlyTotal = (plan: MonthlyPlan) => {
    const monthAttendances = plan.attendedDays.filter(att => {
      const date = new Date(att.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    let total = 0;
    monthAttendances.forEach(att => {
      att.serviceIds.forEach(serviceId => {
        const service = services.find(s => s.id === serviceId);
        if (service) {
          total += service.price;
        }
      });
    });

    if (plan.discountPercentage) {
      total = total * (1 - plan.discountPercentage / 100);
    }

    return total;
  };

  const getMonthAttendances = (plan: MonthlyPlan) => {
    return plan.attendedDays.filter(att => {
      const date = new Date(att.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });
  };

  const togglePlanActive = (plan: MonthlyPlan) => {
    onUpdatePlan({ ...plan, active: !plan.active });
  };

  const activePlans = plans.filter(p => p.active);
  const inactivePlans = plans.filter(p => !p.active);

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-card-foreground flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Planos Mensais
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Novo Plano
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-card-foreground">Criar Plano Mensal</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="clientName" className="text-card-foreground">Nome do Cliente *</Label>
                  <Input
                    id="clientName"
                    value={newPlan.clientName}
                    onChange={(e) => setNewPlan(prev => ({ ...prev, clientName: e.target.value }))}
                    placeholder="Nome do cliente"
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clientPhone" className="text-card-foreground">Telefone (opcional)</Label>
                  <Input
                    id="clientPhone"
                    value={newPlan.clientPhone}
                    onChange={(e) => setNewPlan(prev => ({ ...prev, clientPhone: e.target.value }))}
                    placeholder="(00) 00000-0000"
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="monthlyPrice" className="text-card-foreground">Valor Mensal Fixo (R$)</Label>
                  <Input
                    id="monthlyPrice"
                    type="number"
                    step="0.01"
                    value={newPlan.monthlyPrice}
                    onChange={(e) => setNewPlan(prev => ({ ...prev, monthlyPrice: e.target.value }))}
                    placeholder="0.00"
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discount" className="text-card-foreground">Desconto Mensal (%)</Label>
                  <Input
                    id="discount"
                    type="number"
                    min="0"
                    max="100"
                    value={newPlan.discountPercentage}
                    onChange={(e) => setNewPlan(prev => ({ ...prev, discountPercentage: e.target.value }))}
                    placeholder="Ex: 10 para 10%"
                    className="bg-background"
                  />
                  <p className="text-xs text-muted-foreground">
                    Deixe em branco se usar valor fixo, ou preencha para calcular com desconto sobre os serviços
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-card-foreground">Dias Permitidos</Label>
                  <div className="flex flex-wrap gap-2">
                    {dayOfWeekNames.map((day, index) => (
                      <Button
                        key={index}
                        type="button"
                        variant={newPlan.allowedDays.includes(index) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleToggleDay(index)}
                      >
                        {day}
                      </Button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Selecione os dias da semana que o cliente pode vir
                  </p>
                </div>

                <Button onClick={handleAddPlan} className="w-full" disabled={!newPlan.clientName.trim()}>
                  Criar Plano
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {plans.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhum plano cadastrado. Crie um novo plano mensal.
            </p>
          ) : (
            <Accordion type="multiple" className="space-y-2">
              {activePlans.map(plan => {
                const monthlyTotal = calculateMonthlyTotal(plan);
                const monthAttendances = getMonthAttendances(plan);

                return (
                  <AccordionItem key={plan.id} value={plan.id} className="border border-border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline py-4">
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          <div className="text-left">
                            <p className="font-medium text-card-foreground">{plan.clientName}</p>
                            {plan.clientPhone && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {plan.clientPhone}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Total do Mês</p>
                            <p className="font-bold text-primary">
                              R$ {plan.monthlyPrice > 0 ? plan.monthlyPrice.toFixed(2) : monthlyTotal.toFixed(2)}
                            </p>
                          </div>
                          <Badge variant="secondary">
                            {monthAttendances.length} visitas
                          </Badge>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
                      <div className="space-y-4 pt-2">
                        {/* Plan Details */}
                        <div className="grid grid-cols-2 gap-4 p-3 bg-accent rounded-lg">
                          <div>
                            <p className="text-xs text-muted-foreground">Valor Fixo Mensal</p>
                            <p className="font-medium text-card-foreground">
                              {plan.monthlyPrice > 0 ? `R$ ${plan.monthlyPrice.toFixed(2)}` : 'Por serviço'}
                            </p>
                          </div>
                          {plan.discountPercentage && (
                            <div>
                              <p className="text-xs text-muted-foreground">Desconto</p>
                              <p className="font-medium text-green-600">{plan.discountPercentage}%</p>
                            </div>
                          )}
                          <div>
                            <p className="text-xs text-muted-foreground">Dias Permitidos</p>
                            <div className="flex gap-1 flex-wrap">
                              {plan.allowedDays.length > 0 ? (
                                plan.allowedDays.map(d => (
                                  <Badge key={d} variant="outline" className="text-xs">
                                    {dayOfWeekNames[d]}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-card-foreground">Todos os dias</span>
                              )}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Total Calculado</p>
                            <p className="font-medium text-card-foreground">
                              R$ {monthlyTotal.toFixed(2)}
                            </p>
                          </div>
                        </div>

                        {/* Attendances this month */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-card-foreground flex items-center gap-2">
                              <CalendarCheck className="w-4 h-4" />
                              Presenças do Mês
                            </h4>
                            <Button
                              size="sm"
                              onClick={() => openAttendanceDialog(plan.id)}
                              className="gap-1"
                            >
                              <Plus className="w-3 h-3" />
                              Registrar Visita
                            </Button>
                          </div>
                          
                          {monthAttendances.length > 0 ? (
                            <ScrollArea className="h-[150px]">
                              <div className="space-y-2">
                                {monthAttendances
                                  .sort((a, b) => a.date.localeCompare(b.date))
                                  .map((att, index) => {
                                    const attTotal = att.serviceIds.reduce((sum, sid) => {
                                      const svc = services.find(s => s.id === sid);
                                      return sum + (svc?.price || 0);
                                    }, 0);

                                    return (
                                      <div
                                        key={index}
                                        className="flex items-center justify-between p-2 bg-muted rounded-lg"
                                      >
                                        <div>
                                          <p className="text-sm font-medium text-card-foreground">
                                            {new Date(att.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                                          </p>
                                          <div className="flex flex-wrap gap-1 mt-1">
                                            {att.serviceIds.map(sid => {
                                              const svc = services.find(s => s.id === sid);
                                              return svc ? (
                                                <Badge key={sid} variant="outline" className="text-xs">
                                                  {svc.icon} {svc.name}
                                                </Badge>
                                              ) : null;
                                            })}
                                          </div>
                                        </div>
                                        <p className="font-medium text-primary">R$ {attTotal.toFixed(2)}</p>
                                      </div>
                                    );
                                  })}
                              </div>
                            </ScrollArea>
                          ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">
                              Nenhuma visita registrada este mês
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => togglePlanActive(plan)}
                            className="flex-1"
                          >
                            Desativar Plano
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => onDeletePlan(plan.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}

              {/* Inactive Plans */}
              {inactivePlans.length > 0 && (
                <div className="pt-4">
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Planos Inativos</h4>
                  {inactivePlans.map(plan => (
                    <div
                      key={plan.id}
                      className="flex items-center justify-between p-3 border border-border rounded-lg bg-muted/50 mb-2"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          <User className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <span className="text-muted-foreground">{plan.clientName}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => togglePlanActive(plan)}
                        >
                          Reativar
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDeletePlan(plan.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Accordion>
          )}
        </CardContent>
      </Card>

      {/* Attendance Dialog */}
      <Dialog open={isAttendanceDialogOpen} onOpenChange={setIsAttendanceDialogOpen}>
        <DialogContent className="bg-card max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">Registrar Visita</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="attendanceDate" className="text-card-foreground">Data da Visita</Label>
              <Input
                id="attendanceDate"
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-card-foreground">Serviços Realizados *</Label>
              <div className="flex flex-wrap gap-2">
                {services.map(service => (
                  <ServiceButton
                    key={service.id}
                    service={service}
                    selected={attendanceServices.includes(service.id)}
                    onToggle={handleToggleService}
                  />
                ))}
              </div>
            </div>

            {attendanceServices.length > 0 && (
              <div className="p-3 bg-accent rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total dos serviços:</span>
                  <span className="font-bold text-primary">
                    R$ {attendanceServices.reduce((sum, sid) => {
                      const svc = services.find(s => s.id === sid);
                      return sum + (svc?.price || 0);
                    }, 0).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            <Button
              onClick={handleAddAttendance}
              className="w-full"
              disabled={attendanceServices.length === 0}
            >
              <Check className="w-4 h-4 mr-2" />
              Confirmar Visita
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
