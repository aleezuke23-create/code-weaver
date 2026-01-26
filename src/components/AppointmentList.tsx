import { Appointment, Service, Barber } from '@/types/barber';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, Phone, Check, X, Trash2 } from 'lucide-react';
import { timeSlots } from '@/data/initialData';
import { WhatsAppButton } from '@/components/WhatsAppButton';

interface AppointmentListProps {
  appointments: Appointment[];
  services: Service[];
  barbers: Barber[];
  selectedDate: string;
  currentBarberId: string;
  onUpdateStatus: (id: string, status: Appointment['status']) => void;
  onDelete: (id: string) => void;
}

export function AppointmentList({
  appointments,
  services,
  selectedDate,
  currentBarberId,
  onUpdateStatus,
  onDelete,
}: AppointmentListProps) {
  const filteredAppointments = appointments.filter(
    apt => apt.date === selectedDate && apt.barberId === currentBarberId
  );

  const appointmentsByTime = timeSlots.map(time => ({
    time,
    appointment: filteredAppointments.find(apt => apt.time === time),
  }));

  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-primary/10 text-primary';
    }
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-card-foreground">Agenda do Dia</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-2">
            {appointmentsByTime.map(({ time, appointment }) => (
              <div
                key={time}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  appointment ? 'border-primary bg-primary/5' : 'border-border bg-accent'
                }`}
              >
                <div className="flex items-center gap-2 min-w-[80px]">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium text-card-foreground">{time}</span>
                </div>

                {appointment ? (
                  <div className="flex-1 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-card-foreground">
                          {appointment.clientName}
                        </span>
                        <Badge className={getStatusColor(appointment.status)}>
                          {appointment.status === 'scheduled' && 'Agendado'}
                          {appointment.status === 'completed' && 'Concluído'}
                          {appointment.status === 'cancelled' && 'Cancelado'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="w-3 h-3" />
                        {appointment.clientPhone}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {appointment.services.map(serviceId => {
                          const service = services.find(s => s.id === serviceId);
                          return service ? (
                            <span
                              key={serviceId}
                              className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded"
                            >
                              {service.icon} {service.name}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>

                    {appointment.status === 'scheduled' && (
                      <div className="flex gap-1">
                        <WhatsAppButton
                          phone={appointment.clientPhone}
                          clientName={appointment.clientName}
                          appointmentTime={appointment.time}
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-green-600 hover:bg-green-100"
                          onClick={() => onUpdateStatus(appointment.id, 'completed')}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => onUpdateStatus(appointment.id, 'cancelled')}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}

                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => onDelete(appointment.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">Horário livre</span>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
