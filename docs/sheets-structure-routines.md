# Estructura de Google Sheets para Rutinas Diarias

## Hojas Requeridas

### Hoja 1: `routines`

Encabezados (fila 1):
```
A1: id
B1: userId
C1: title
D1: type
E1: minValue
F1: unit
G1: active
```

Ejemplos de datos:
```
routine_1234567890 | user@example.com | Leer | quantity | 1 | carilla | TRUE
routine_1234567891 | user@example.com | Ejercicio | time | 10 | min | TRUE
routine_1234567892 | user@example.com | Agua | quantity | 1 | litro | TRUE
routine_1234567893 | user@example.com | Curso | time | 15 | min | TRUE
```

### Hoja 2: `daily_logs`

Encabezados (fila 1):
```
A1: id
B1: routineId
C1: userId
D1: date
E1: completed
F1: value
```

Ejemplos de datos:
```
log_1234567890 | routine_1234567890 | user@example.com | 2024-01-15 | TRUE | 1
log_1234567891 | routine_1234567891 | user@example.com | 2024-01-15 | TRUE | 10
log_1234567892 | routine_1234567890 | user@example.com | 2024-01-16 | TRUE | 2
```

**Notas:**
- `date` debe estar en formato `YYYY-MM-DD`
- `completed` es `TRUE` o `FALSE`
- `value` es el valor real cumplido (puede ser mayor al mínimo)

### Hoja 3: `stats`

Encabezados (fila 1):
```
A1: userId
B1: streak
C1: lastCompletedDate
```

Ejemplos de datos:
```
user@example.com | 5 | 2024-01-15
```

**Notas:**
- `streak` es el número de días consecutivos cumpliendo al menos una rutina
- `lastCompletedDate` es la última fecha en formato `YYYY-MM-DD` donde cumplió al menos una rutina

## Configuración Inicial

1. Crea las 3 hojas en tu Google Sheet
2. Agrega los encabezados en la fila 1 de cada hoja
3. Comparte el Sheet con la cuenta de servicio de Google
4. Configura las variables de entorno en `.env.local`

## Migración desde el Sistema Anterior

Si tenías el sistema de tasks/timeboxes, puedes mantener esas hojas y crear las nuevas. La app ahora usa:
- `routines` en lugar de `tasks`
- `daily_logs` en lugar de `timeboxes`
- `stats` actualizado (solo streak y lastCompletedDate)
