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

async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('Este navegador não suporta notificações');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

function sendBrowserNotification(title: string, body: string) {
  if (Notification.permission === 'granted') {
    const notification = new Notification(title, {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'appointment-reminder',
      requireInteraction: true,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    // Auto close after 30 seconds
    setTimeout(() => notification.close(), 30000);
  }
}

export function useAppointmentReminder(
  appointments: Appointment[],
  selectedDate: string,
  currentBarberId: string
) {
  const notifiedAppointments = useRef<Set<string>>(new Set());
  const permissionRequested = useRef(false);

  // Request permission on mount
  useEffect(() => {
    if (!permissionRequested.current) {
      permissionRequested.current = true;
      requestNotificationPermission().then((granted) => {
        if (granted) {
          toast({
            title: "🔔 Notificações ativadas",
            description: "Você receberá alertas 5 minutos antes dos agendamentos.",
            duration: 5000,
          });
        }
      });
    }
  }, []);

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

        // Play sound
        playNotificationSound();

        // Show toast
        toast({
          title: "⏰ Lembrete de Agendamento!",
          description: `${appointment.clientName} às ${appointment.time} - em 5 minutos!`,
          duration: 10000,
        });

        // Send browser notification
        sendBrowserNotification(
          "⏰ Cliente chegando em 5 minutos!",
          `${appointment.clientName} às ${appointment.time}`
        );
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

  return { playNotificationSound, requestNotificationPermission };
}
