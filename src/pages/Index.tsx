import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QuickCutForm } from '@/components/QuickCutForm';
import { DashboardStats } from '@/components/DashboardStats';
import { CutHistory } from '@/components/CutHistory';
import { AppointmentList } from '@/components/AppointmentList';
import { NewAppointmentDialog } from '@/components/NewAppointmentDialog';
import { CashFlow } from '@/components/CashFlow';
import { BillsManager } from '@/components/BillsManager';
import { ServicesManager } from '@/components/ServicesManager';
import { BarbersManager } from '@/components/BarbersManager';
import { DateSelector } from '@/components/DateSelector';
import { MonthlyAnalysis } from '@/components/MonthlyAnalysis';
import { FiadosManager } from '@/components/FiadosManager';
import { MensalidadeManager } from '@/components/MensalidadeManager';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useAppointmentReminder } from '@/hooks/useAppointmentReminder';
import { defaultServices, defaultBarbers } from '@/data/initialData';
import { Service, Barber, Appointment, CutRecord, Transaction, Bill, Fiado, MonthlyPlan } from '@/types/barber';
import { Scissors, Calendar, Wallet, Receipt, Settings, BarChart3, CreditCard, CalendarDays } from 'lucide-react';

const Index = () => {
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);

  const [services, setServices] = useLocalStorage<Service[]>('barber-services', defaultServices);
  const [barbers, setBarbers] = useLocalStorage<Barber[]>('barber-barbers', defaultBarbers);
  const [appointments, setAppointments] = useLocalStorage<Appointment[]>('barber-appointments', []);
  const [cuts, setCuts] = useLocalStorage<CutRecord[]>('barber-cuts', []);
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('barber-transactions', []);
  const [bills, setBills] = useLocalStorage<Bill[]>('barber-bills', []);
  const [fiados, setFiados] = useLocalStorage<Fiado[]>('barber-fiados', []);
  const [monthlyPlans, setMonthlyPlans] = useLocalStorage<MonthlyPlan[]>('barber-monthly-plans', []);

  const [currentBarberId, setCurrentBarberId] = useState(barbers[0]?.id || '1');

  const { activeAlarmAppointment, dismissAlarm } = useAppointmentReminder(appointments, selectedDate, currentBarberId);

  const handleAddCut = (cut: CutRecord) => {
    setCuts(prev => [...prev, cut]);
    const newTransaction: Transaction = {
      id: Date.now().toString() + '-auto',
      type: 'income',
      category: 'Cortes',
      description: cut.clientName || 'Corte',
      amount: cut.total,
      date: cut.date,
      createdAt: new Date().toISOString(),
    };
    setTransactions(prev => [...prev, newTransaction]);
  };

  const handleDeleteCut = (cutId: string) => {
    setCuts(prev => prev.filter(c => c.id !== cutId));
  };

  const handleAddAppointment = (appointment: Appointment) => {
    setAppointments(prev => [...prev, appointment]);
  };

  const handleUpdateAppointmentStatus = (id: string, status: Appointment['status']) => {
    setAppointments(prev => prev.map(apt =>
      apt.id === id ? { ...apt, status } : apt
    ));
  };

  const handleDeleteAppointment = (id: string) => {
    setAppointments(prev => prev.filter(apt => apt.id !== id));
  };

  const handleAddTransaction = (transaction: Transaction) => {
    setTransactions(prev => [...prev, transaction]);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const handleAddBill = (bill: Bill) => {
    setBills(prev => [...prev, bill]);
  };

  const handleUpdateBill = (bill: Bill) => {
    setBills(prev => prev.map(b => b.id === bill.id ? bill : b));
  };

  const handleDeleteBill = (id: string) => {
    setBills(prev => prev.filter(b => b.id !== id));
  };

  const handleAddFiado = (fiado: Fiado) => {
    setFiados(prev => [...prev, fiado]);
  };

  const handleUpdateFiado = (fiado: Fiado) => {
    setFiados(prev => prev.map(f => f.id === fiado.id ? fiado : f));
  };

  const handleDeleteFiado = (id: string) => {
    setFiados(prev => prev.filter(f => f.id !== id));
  };

  const handleAddMonthlyPlan = (plan: MonthlyPlan) => {
    setMonthlyPlans(prev => [...prev, plan]);
  };

  const handleUpdateMonthlyPlan = (plan: MonthlyPlan) => {
    setMonthlyPlans(prev => prev.map(p => p.id === plan.id ? plan : p));
  };

  const handleDeleteMonthlyPlan = (id: string) => {
    setMonthlyPlans(prev => prev.filter(p => p.id !== id));
  };

  const handleAddService = (service: Service) => {
    setServices(prev => [...prev, service]);
  };

  const handleUpdateService = (service: Service) => {
    setServices(prev => prev.map(s => s.id === service.id ? service : s));
  };

  const handleDeleteService = (id: string) => {
    setServices(prev => prev.filter(s => s.id !== id));
  };

  const handleAddBarber = (barber: Barber) => {
    setBarbers(prev => [...prev, barber]);
  };

  const handleUpdateBarber = (barber: Barber) => {
    setBarbers(prev => prev.map(b => b.id === barber.id ? barber : b));
  };

  const handleDeleteBarber = (id: string) => {
    setBarbers(prev => prev.filter(b => b.id !== id));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <Scissors className="w-6 h-6 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold text-card-foreground">BarberPro</h1>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <DateSelector selectedDate={selectedDate} onDateChange={setSelectedDate} />

              {barbers.length > 1 && (
                <Select value={currentBarberId} onValueChange={setCurrentBarberId}>
                  <SelectTrigger className="w-[180px] bg-background">
                    <SelectValue placeholder="Selecione barbeiro" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {barbers.map(barber => (
                      <SelectItem key={barber.id} value={barber.id}>
                        {barber.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid grid-cols-8 w-full max-w-5xl mx-auto bg-muted">
            <TabsTrigger value="dashboard" className="gap-2 data-[state=active]:bg-card">
              <Scissors className="w-4 h-4" />
              <span className="hidden sm:inline">Cortes</span>
            </TabsTrigger>
            <TabsTrigger value="appointments" className="gap-2 data-[state=active]:bg-card">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Agenda</span>
            </TabsTrigger>
            <TabsTrigger value="fiados" className="gap-2 data-[state=active]:bg-card">
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">Fiados</span>
            </TabsTrigger>
            <TabsTrigger value="mensalidade" className="gap-2 data-[state=active]:bg-card">
              <CalendarDays className="w-4 h-4" />
              <span className="hidden sm:inline">Mensal</span>
            </TabsTrigger>
            <TabsTrigger value="analysis" className="gap-2 data-[state=active]:bg-card">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Análise</span>
            </TabsTrigger>
            <TabsTrigger value="cashflow" className="gap-2 data-[state=active]:bg-card">
              <Wallet className="w-4 h-4" />
              <span className="hidden sm:inline">Caixa</span>
            </TabsTrigger>
            <TabsTrigger value="bills" className="gap-2 data-[state=active]:bg-card">
              <Receipt className="w-4 h-4" />
              <span className="hidden sm:inline">Contas</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2 data-[state=active]:bg-card">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Config</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <DashboardStats cuts={cuts} services={services} selectedDate={selectedDate} />
            <QuickCutForm
              services={services}
              barbers={barbers}
              currentBarberId={currentBarberId}
              onAddCut={handleAddCut}
            />
            <CutHistory
              cuts={cuts}
              services={services}
              selectedDate={selectedDate}
              onDeleteCut={handleDeleteCut}
            />
          </TabsContent>

          <TabsContent value="appointments" className="space-y-6">
            <div className="flex justify-end">
              <NewAppointmentDialog
                services={services}
                barbers={barbers}
                currentBarberId={currentBarberId}
                selectedDate={selectedDate}
                appointments={appointments}
                onAddAppointment={handleAddAppointment}
              />
            </div>
            <AppointmentList
              appointments={appointments}
              services={services}
              barbers={barbers}
              selectedDate={selectedDate}
              currentBarberId={currentBarberId}
              onUpdateStatus={handleUpdateAppointmentStatus}
              onDelete={handleDeleteAppointment}
              activeAlarmAppointment={activeAlarmAppointment}
              onDismissAlarm={dismissAlarm}
            />
          </TabsContent>

          <TabsContent value="fiados">
            <FiadosManager
              fiados={fiados}
              services={services}
              onAddFiado={handleAddFiado}
              onUpdateFiado={handleUpdateFiado}
              onDeleteFiado={handleDeleteFiado}
            />
          </TabsContent>

          <TabsContent value="mensalidade">
            <MensalidadeManager
              plans={monthlyPlans}
              services={services}
              onAddPlan={handleAddMonthlyPlan}
              onUpdatePlan={handleUpdateMonthlyPlan}
              onDeletePlan={handleDeleteMonthlyPlan}
            />
          </TabsContent>

          <TabsContent value="analysis">
            <MonthlyAnalysis
              cuts={cuts}
              services={services}
              transactions={transactions}
              appointments={appointments}
            />
          </TabsContent>

          <TabsContent value="cashflow">
            <CashFlow
              transactions={transactions}
              onAddTransaction={handleAddTransaction}
              onDeleteTransaction={handleDeleteTransaction}
              selectedDate={selectedDate}
            />
          </TabsContent>

          <TabsContent value="bills">
            <BillsManager
              bills={bills}
              onAddBill={handleAddBill}
              onUpdateBill={handleUpdateBill}
              onDeleteBill={handleDeleteBill}
            />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <ServicesManager
              services={services}
              onAddService={handleAddService}
              onUpdateService={handleUpdateService}
              onDeleteService={handleDeleteService}
            />
            <BarbersManager
              barbers={barbers}
              onAddBarber={handleAddBarber}
              onUpdateBarber={handleUpdateBarber}
              onDeleteBarber={handleDeleteBarber}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
