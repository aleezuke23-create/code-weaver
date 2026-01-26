import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ServiceButton } from './ServiceButton';
import { Service, Appointment, Barber } from '@/types/barber';
import { timeSlots } from '@/data/initialData';
import { Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface NewAppointmentDialogProps {
  services: Service[];
  barbers: Barber[];
  currentBarberId: string;
  selectedDate: string;
  appointments: Appointment[];
  onAddAppointment: (appointment: Appointment) => void;
}

export function NewAppointmentDialog({
  services,
  currentBarberId,
  selectedDate,
  appointments,
  onAddAppointment,
}: NewAppointmentDialogProps) {
  const [open, setOpen] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const bookedTimes = appointments
    .filter(apt => apt.date === selectedDate && apt.barberId === currentBarberId && apt.status !== 'cancelled')
    .map(apt => apt.time);

  const availableTimes = timeSlots.filter(time => !bookedTimes.includes(time));

  const toggleService = (serviceId: string) => {
    setSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleSubmit = () => {
    if (!clientName || !clientPhone || !selectedTime || selectedServices.length === 0) {
      toast({
        title: "Preencha todos os campos",
        variant: "destructive"
      });
      return;
    }

    const newAppointment: Appointment = {
      id: Date.now().toString(),
      clientName,
      clientPhone,
      barberId: currentBarberId,
      date: selectedDate,
      time: selectedTime,
      services: selectedServices,
      status: 'scheduled',
    };

    onAddAppointment(newAppointment);
    setOpen(false);
    resetForm();

    toast({
      title: "Agendamento criado!",
      description: `${clientName} às ${selectedTime}`,
    });
  };

  const resetForm = () => {
    setClientName('');
    setClientPhone('');
    setSelectedTime('');
    setSelectedServices([]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Agendamento
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-card">
        <DialogHeader>
          <DialogTitle className="text-card-foreground">Novo Agendamento</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Nome do Cliente</Label>
              <Input
                id="clientName"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Nome completo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientPhone">Telefone</Label>
              <Input
                id="clientPhone"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Horário</Label>
            <Select value={selectedTime} onValueChange={setSelectedTime}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Selecione o horário" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                {availableTimes.map(time => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Serviços</Label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {services.map(service => (
                <ServiceButton
                  key={service.id}
                  service={service}
                  selected={selectedServices.includes(service.id)}
                  onToggle={toggleService}
                />
              ))}
            </div>
          </div>

          <Button onClick={handleSubmit} className="w-full">
            Confirmar Agendamento
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
