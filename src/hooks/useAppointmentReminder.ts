import { useEffect, useRef, useCallback } from 'react';
import { Appointment } from '@/types/barber';
import { toast } from '@/hooks/use-toast';

function playNotificationSound() {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    const playTone = (frequency: number, startTime: number, duration: number) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };

    const now = audioContext.currentTime;
    playTone(523.25, now, 0.2);
    playTone(659.25, now + 0.2, 0.2);
    playTone(783.99, now + 0.4, 0.3);

  } catch (error) {
    console.error('Erro ao tocar som de notificação:', error);
  }
}

export function useAppointmentReminder(
  appointments: Appointment[],
  selectedDate: string,
  currentBarberId: string
) {
  const notifiedAppointments = useRef<Set<string>>(new Set());

  const checkReminders = useCallback(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    if (selectedDate !== todayStr) return;

    const scheduledAppointments = appointments.filter(
      apt => apt.date === todayStr &&
             apt.barberId === currentBarberId &&
             apt.status === 'scheduled'
    );

    scheduledAppointments.forEach(appointment => {
      const [hours, minutes] = appointment.time.split(':').map(Number);
      const appointmentTime = new Date(now);
      appointmentTime.setHours(hours, minutes, 0, 0);

      const diffMs = appointmentTime.getTime() - now.getTime();
      const diffMinutes = diffMs / (1000 * 60);

      if (diffMinutes > 4 && diffMinutes <= 6 && !notifiedAppointments.current.has(appointment.id)) {
        notifiedAppointments.current.add(appointment.id);

        playNotificationSound();

        toast({
          title: "⏰ Lembrete de Agendamento!",
          description: `${appointment.clientName} às ${appointment.time} - em 5 minutos!`,
          duration: 10000,
        });
      }
    });
  }, [appointments, selectedDate, currentBarberId]);

  useEffect(() => {
    const interval = setInterval(checkReminders, 30000);
    checkReminders();
    return () => clearInterval(interval);
  }, [checkReminders]);

  useEffect(() => {
    notifiedAppointments.current.clear();
  }, [selectedDate]);

  return { playNotificationSound };
}
