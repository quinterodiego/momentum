/**
 * Pluraliza una unidad libre (texto que el usuario tipeó al crear la
 * rutina, ej. "litro", "vez", "clase") según reglas comunes del español.
 * No es perfecto para cualquier palabra, pero cubre bien los casos
 * típicos de esta app. El valor 1 siempre devuelve la unidad tal cual
 * fue guardada (singular).
 */

const INVARIANT_UNITS = new Set(['min']); // abreviatura, no es una palabra real

export function pluralizeUnit(value: number, unit: string): string {
  const trimmed = unit?.trim() ?? '';
  if (!trimmed || value === 1) return trimmed;
  if (INVARIANT_UNITS.has(trimmed.toLowerCase())) return trimmed;

  if (/z$/i.test(trimmed)) {
    return trimmed.slice(0, -1) + 'ces'; // vez -> veces, luz -> luces
  }
  if (/[aeiouáéíóú]$/i.test(trimmed)) {
    return trimmed + 's'; // litro -> litros, clase -> clases
  }
  return trimmed + 'es'; // mes -> meses
}
