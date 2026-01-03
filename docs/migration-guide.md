# Guía de Migración: De Tareas a Rutinas Diarias

## 📊 Comparación de Estructuras

### ❌ Hojas que NO se pueden reutilizar

#### `tasks` → Reemplazada por `routines`
**Antes:**
```
id | userId | title | active | createdAt
```

**Ahora:**
```
id | userId | title | type | minValue | unit | active
```

**Razón:** La estructura cambió completamente. Ahora necesitamos `type` (time/quantity), `minValue` y `unit`.

#### `timeboxes` → Reemplazada por `daily_logs`
**Antes:**
```
id | userId | taskId | duration | status | startedAt | endedAt
```

**Ahora:**
```
id | routineId | userId | date | completed | value
```

**Razón:** El concepto cambió de "timeboxes" a "logs diarios". Ahora registramos por fecha (YYYY-MM-DD) y valor cumplido.

### ✅ Hoja que SÍ se puede reutilizar (con ajustes)

#### `stats` → Se puede reutilizar (con cambios)

**Antes:**
```
userId | streak | lastCompletedAt | avgDuration
```

**Ahora:**
```
userId | streak | lastCompletedDate
```

**Cambios necesarios:**
1. Eliminar la columna `avgDuration` (columna D)
2. Renombrar `lastCompletedAt` a `lastCompletedDate` (solo el nombre, el formato sigue siendo YYYY-MM-DD)

**Si ya tenés datos en stats:**
- Podés mantener la columna `avgDuration` (la app la ignorará)
- Solo asegurate de que `lastCompletedAt` tenga formato `YYYY-MM-DD`

## 🔄 Opciones de Migración

### Opción 1: Crear hojas nuevas (Recomendado)

1. **Mantener las hojas viejas** (por si necesitás los datos)
2. **Crear las 3 hojas nuevas:**
   - `routines`
   - `daily_logs`
   - Actualizar `stats` (eliminar columna D si existe)

**Ventajas:**
- No perdés datos históricos
- Podés comparar estructuras
- Más seguro

### Opción 2: Renombrar y modificar

1. **Renombrar `tasks` → `routines`**
   - Agregar columnas: `type` (D), `minValue` (E), `unit` (F)
   - Mover `active` a columna G
   - Eliminar `createdAt`

2. **Renombrar `timeboxes` → `daily_logs`**
   - Cambiar estructura completamente
   - Mejor crear nueva hoja

3. **Modificar `stats`**
   - Eliminar columna `avgDuration`
   - Renombrar `lastCompletedAt` → `lastCompletedDate`

**Ventajas:**
- Menos hojas en total
- Más limpio

**Desventajas:**
- Perdés datos históricos de timeboxes
- Más trabajo manual

## 📝 Pasos Recomendados

### Paso 1: Crear nuevas hojas

En tu Google Sheet existente:

1. **Crear hoja `routines`**
   - Encabezados: `id | userId | title | type | minValue | unit | active`

2. **Crear hoja `daily_logs`**
   - Encabezados: `id | routineId | userId | date | completed | value`

3. **Actualizar hoja `stats`**
   - Eliminar columna D (`avgDuration`) si existe
   - Verificar que columna C sea `lastCompletedDate` (o renombrarla)

### Paso 2: (Opcional) Migrar datos de tasks a routines

Si tenías tareas que querés convertir en rutinas:

1. Para cada tarea activa, crear una rutina:
   - `type`: decidir si es `time` o `quantity`
   - `minValue`: definir mínimo (ej: 10 para tiempo, 1 para cantidad)
   - `unit`: `min` para time, o la unidad que corresponda

**Ejemplo:**
```
Tarea: "Estudiar" → Rutina: "Estudiar" | time | 15 | min
Tarea: "Leer" → Rutina: "Leer" | quantity | 1 | carilla
```

### Paso 3: Verificar

1. Las 3 hojas nuevas existen
2. Los encabezados están correctos
3. La app funciona correctamente

## ⚠️ Importante

- **Las hojas `tasks` y `timeboxes` ya no se usan** - Podés eliminarlas o dejarlas como respaldo
- **La app ahora busca `routines` y `daily_logs`** - Si no existen, dará error
- **La hoja `stats` se actualiza automáticamente** - Solo necesitás la estructura correcta

## 🆘 Si ya tenés datos

Si tenías datos en las hojas viejas y querés conservarlos:

1. **Exportar datos** (por si acaso)
2. **Crear las nuevas hojas**
3. **Migrar manualmente** las tareas activas a rutinas
4. **Los timeboxes no se migran** (son conceptos diferentes)
