/**
 * Utilidades de fecha compartidas. Todas trabajan con strings 'YYYY-MM-DD'
 * (el formato que devuelve getTodayDate() y en el que se guardan las
 * fechas de daily_logs), parseadas a mediodía local para evitar
 * corrimientos de un día por zona horaria al sumar/restar días.
 */

export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0);
}

export function addDays(date: Date, amount: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Día de la semana (0=Domingo ... 6=Sábado) de una fecha 'YYYY-MM-DD'.
 */
export function getDayOfWeek(dateStr: string): number {
  return parseLocalDate(dateStr).getDay();
}
