export interface Service {
  id: string;
  name: string;
  price: number;
  icon: string;
}

export interface Barber {
  id: string;
  name: string;
  avatar?: string;
}

export interface Appointment {
  id: string;
  clientName: string;
  clientPhone: string;
  barberId: string;
  date: string;
  time: string;
  services: string[];
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
}

export interface MonthlyPlan {
  id: string;
  clientName: string;
  clientPhone?: string;
  monthlyPrice: number;
  discountPercentage?: number;
  allowedDays: number[];
  attendedDays: { date: string; serviceIds: string[] }[];
  createdAt: string;
  active: boolean;
}

export interface CutRecord {
  id: string;
  barberId: string;
  date: string;
  services: string[];
  total: number;
  clientName?: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  date: string;
  createdAt: string;
}

export interface Bill {
  id: string;
  description: string;
  amount: number;
  dueDate: string;
  paid: boolean;
  paidAt?: string;
}

export interface FiadoEntry {
  id: string;
  amount: number;
  description: string;
  serviceIds?: string[];
  createdAt: string;
  paid: boolean;
  paidAt?: string;
}

export interface Fiado {
  id: string;
  clientName: string;
  clientPhone?: string;
  entries: FiadoEntry[];
  createdAt: string;
}
