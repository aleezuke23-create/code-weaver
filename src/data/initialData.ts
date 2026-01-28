import { Service, Barber } from '@/types/barber';

export const defaultServices: Service[] = [
  { id: '1', name: 'Cabelo', price: 35, icon: '✂️' },
  { id: '2', name: 'Barba', price: 25, icon: '🧔' },
  { id: '3', name: 'Sobrancelha', price: 15, icon: '👁️' },
  { id: '4', name: 'Luzes', price: 80, icon: '💇' },
  { id: '5', name: 'Pigmentação', price: 60, icon: '🎨' },
  { id: '6', name: 'Relaxamento', price: 50, icon: '💆' },
];

export const defaultBarbers: Barber[] = [
  { id: '1', name: 'Você' },
];

export const timeSlots = [
  '06:00', '06:30', '07:00', '07:30', '08:00', '08:30',
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30',
  '21:00', '21:30', '22:00', '22:30', '23:00',
];
