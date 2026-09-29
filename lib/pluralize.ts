/**
 * Pluraliza una unidad libre (texto que el usuario tipeó al crear la
 * rutina, ej. "litro", "vez", "clase", "pagina") según reglas comunes
 * del español. No es perfecto para cualquier palabra, pero cubre bien
 * los casos típicos de esta app.
 *
 * Primero normaliza a singular (por si la unidad ya quedó guardada en
 * plural, ej. "paginas") y recién ahí pluraliza según el valor pedido —
 * así el resultado es correcto sin importar cómo esté guardada la
 * unidad, sin necesidad de tocar ese dato guardado.
 */

const INVARIANT_UNITS = new Set(['min']); // abreviatura, no es una palabra real

function toSingular(unit: string): string {
  if (INVARIANT_UNITS.has(unit.toLowerCase())) return unit;
  if (/ces$/i.test(unit)) return unit.slice(0, -3) + 'z'; // veces -> vez, luces -> luz
  if (/s$/i.test(unit) && unit.length > 1) return unit.slice(0, -1); // paginas -> pagina, litros -> litro
  return unit;
}

export function pluralizeUnit(value: number, unit: string): string {
  const trimmed = unit?.trim() ?? '';
  if (!trimmed) return trimmed;

  const singular = toSingular(trimmed);
  if (value === 1 || INVARIANT_UNITS.has(singular.toLowerCase())) return singular;

  if (/z$/i.test(singular)) {
    return singular.slice(0, -1) + 'ces'; // vez -> veces, luz -> luces
  }
  if (/[aeiouáéíóú]$/i.test(singular)) {
    return singular + 's'; // pagina -> paginas, litro -> litros, clase -> clases
  }
  return singular + 'es'; // mes -> meses
}
