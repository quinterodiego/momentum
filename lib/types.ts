/**
 * Tipos principales de la aplicación Momentum
 * Sistema de rutinas diarias mínimas
 */

export type RoutineType = 'time' | 'quantity';

export interface Routine {
  id: string;
  userId: string;
  title: string;
  type: RoutineType;
  minValue: number; // minutos para time, cantidad para quantity
  unit: string; // "min", "carilla", "litro", etc.
  active: boolean;
  scheduledDays: number[]; // 0=Dom, 1=Lun, 2=Mar, 3=Mié, 4=Jue, 5=Vie, 6=Sáb. Vacío = todos los días
}

export interface DailyLog {
  id: string;
  routineId: string;
  userId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  value: number; // valor real cumplido (puede ser mayor al mínimo)
}

export interface Stats {
  userId: string;
  streak: number; // días consecutivos cumpliendo al menos una rutina
  lastCompletedDate: string | null; // YYYY-MM-DD
}

export interface RoutineWithStatus extends Routine {
  completed: boolean;
  todayLog: DailyLog | null;
}

