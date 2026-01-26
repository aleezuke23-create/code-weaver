import { Appointment, Service, Barber } from '@/types/barber';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, Phone, Check, X, Trash2, UserX, Bell, BellOff } from 'lucide-react';
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
  activeAlarmAppointment?: Appointment | null;
  onDismissAlarm?: () => void;
}

export function AppointmentList({
  appointments,
  services,
  selectedDate,
  currentBarberId,
  onUpdateStatus,
  onDelete,
  activeAlarmAppointment,
  onDismissAlarm,
}: AppointmentListProps) {
  const filteredAppointments = appointments.filter(
    apt => apt.date === selectedDate && apt.barberId === currentBarberId
  );

  const scheduledToday = filteredAppointments.filter(apt => apt.status === 'scheduled');

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
      case 'no_show':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-primary/10 text-primary';
    }
  };

  const getStatusLabel = (status: Appointment['status']) => {
    switch (status) {
      case 'scheduled':
        return 'Agendado';
      case 'completed':
        return 'Concluído';
      case 'cancelled':
        return 'Cancelado';
      case 'no_show':
        return 'Não Veio';
      default:
        return status;
    }
  };

  const handleStatusChange = (id: string, status: Appointment['status']) => {
    onUpdateStatus(id, status);
    // Dismiss alarm when status changes
    if (activeAlarmAppointment?.id === id && onDismissAlarm) {
      onDismissAlarm();
    }
  };

  const handleWhatsAppClick = (appointmentId: string) => {
    // Dismiss alarm when WhatsApp is clicked
    if (activeAlarmAppointment?.id === appointmentId && onDismissAlarm) {
      onDismissAlarm();
    }
  };

  return (
    <div className="space-y-4">
      {/* Active Alarm Banner */}
      {activeAlarmAppointment && (
        <Card className="border-destructive bg-destructive/10 animate-pulse">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-6 h-6 text-destructive animate-bounce" />
                <div>
                  <p className="font-bold text-destructive">⏰ ALARME - Cliente chegando!</p>
                  <p className="text-sm text-card-foreground">
                    {activeAlarmAppointment.clientName} às {activeAlarmAppointment.time}
                  </p>
                </div>
              </div>
              <Button
                variant="destructive"
                onClick={onDismissAlarm}
                className="gap-2"
              >
                <BellOff className="w-4 h-4" />
                Parar Alarme
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Today's Scheduled Summary */}
      {scheduledToday.length > 0 && (
        <Card className="border-primary bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-primary flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Agendados para Hoje ({scheduledToday.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {scheduledToday
                .sort((a, b) => a.time.localeCompare(b.time))
                .map(apt => (
                  <Badge
                    key={apt.id}
                    variant="secondary"
                    className="px-3 py-1.5 text-sm bg-card border border-border"
                  >
                    <Clock className="w-3 h-3 mr-1" />
                    {apt.time} - {apt.clientName}
                  </Badge>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Full Agenda */}
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
                    appointment 
                      ? appointment.id === activeAlarmAppointment?.id
                        ? 'border-destructive bg-destructive/10 animate-pulse'
                        : 'border-primary bg-primary/5' 
                      : 'border-border bg-accent'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-[80px]">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium text-card-foreground">{time}</span>
                  </div>

                  {appointment ? (
                    <div className="flex-1 flex items-center justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-card-foreground">
                            {appointment.clientName}
                          </span>
                          <Badge className={getStatusColor(appointment.status)}>
                            {getStatusLabel(appointment.status)}
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

                      <div className="flex gap-1 flex-shrink-0">
                        {appointment.status === 'scheduled' && (
                          <>
                            <WhatsAppButton
                              phone={appointment.clientPhone}
                              clientName={appointment.clientName}
                              appointmentTime={appointment.time}
                              onClick={() => handleWhatsAppClick(appointment.id)}
                            />
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-green-600 hover:bg-green-100"
                              onClick={() => handleStatusChange(appointment.id, 'completed')}
                              title="Confirmar atendimento"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-orange-600 hover:bg-orange-100"
                              onClick={() => handleStatusChange(appointment.id, 'no_show')}
                              title="Não veio"
                            >
                              <UserX className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-destructive hover:bg-destructive/10"
                              onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                              title="Cancelar"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => onDelete(appointment.id)}
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
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
    </div>
  );
}
