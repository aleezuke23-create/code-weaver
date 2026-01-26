import { useEffect, useRef, useCallback, useState } from 'react';
import { Appointment } from '@/types/barber';
import { toast } from '@/hooks/use-toast';

let alarmInterval: NodeJS.Timeout | null = null;
let audioContext: AudioContext | null = null;

function playAlarmSound() {
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const playBeep = (frequency: number, startTime: number, duration: number) => {
      const oscillator = audioContext!.createOscillator();
      const gainNode = audioContext!.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext!.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'square';

      gainNode.gain.setValueAtTime(0.3, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };

    const now = audioContext.currentTime;
    // Alarm pattern - repeated beeps
    playBeep(880, now, 0.15);
    playBeep(880, now + 0.2, 0.15);
    playBeep(880, now + 0.4, 0.15);
    playBeep(1100, now + 0.6, 0.3);

  } catch (error) {
    console.error('Erro ao tocar som de alarme:', error);
  }
}

export function startContinuousAlarm() {
  if (alarmInterval) return;
  
  playAlarmSound();
  alarmInterval = setInterval(() => {
    playAlarmSound();
  }, 1500);
}

export function stopContinuousAlarm() {
  if (alarmInterval) {
    clearInterval(alarmInterval);
    alarmInterval = null;
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

    setTimeout(() => notification.close(), 60000);
  }
}

export function useAppointmentReminder(
  appointments: Appointment[],
  selectedDate: string,
  currentBarberId: string
) {
  const notifiedAppointments = useRef<Set<string>>(new Set());
  const permissionRequested = useRef(false);
  const [activeAlarmAppointment, setActiveAlarmAppointment] = useState<Appointment | null>(null);

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

  const dismissAlarm = useCallback(() => {
    stopContinuousAlarm();
    setActiveAlarmAppointment(null);
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

        // Start continuous alarm
        startContinuousAlarm();
        setActiveAlarmAppointment(appointment);

        // Show toast
        toast({
          title: "⏰ CLIENTE CHEGANDO!",
          description: `${appointment.clientName} às ${appointment.time} - em 5 minutos!`,
          duration: 0, // Persistent until dismissed
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

  // Cleanup alarm on unmount
  useEffect(() => {
    return () => {
      stopContinuousAlarm();
    };
  }, []);

  return { 
    activeAlarmAppointment, 
    dismissAlarm,
    startContinuousAlarm,
    stopContinuousAlarm,
    requestNotificationPermission 
  };
}
