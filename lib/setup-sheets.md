# Guía de Configuración de Google Sheets

## Paso 1: Crear el Google Sheet

1. Ve a [Google Sheets](https://sheets.google.com)
2. Crea un nuevo documento
3. Nómbralo "Empezá - Base de Datos"
4. Copia el ID del spreadsheet de la URL:
   ```
   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
   ```

## Paso 2: Crear las Hojas

### Hoja 1: `tasks`
1. Renombra la primera hoja a `tasks`
2. En la fila 1, agrega los encabezados:
   ```
   A1: id
   B1: userId
   C1: title
   D1: active
   E1: createdAt
   ```

### Hoja 2: `timeboxes`
1. Crea una nueva hoja y nómbrala `timeboxes`
2. En la fila 1, agrega los encabezados:
   ```
   A1: id
   B1: userId
   C1: taskId
   D1: duration
   E1: status
   F1: startedAt
   G1: endedAt
   ```

### Hoja 3: `stats`
1. Crea una nueva hoja y nómbrala `stats`
2. En la fila 1, agrega los encabezados:
   ```
   A1: userId
   B1: streak
   C1: lastCompletedAt
   D1: avgDuration
   ```

## Paso 3: Configurar Permisos

1. Ve a Google Cloud Console
2. Crea una cuenta de servicio o usa una existente
3. Copia el email de la cuenta de servicio (ej: `empeza@project.iam.gserviceaccount.com`)
4. En Google Sheets, haz clic en "Compartir"
5. Agrega el email de la cuenta de servicio con permisos de "Editor"
6. Guarda el ID del spreadsheet en tu `.env.local`

## Paso 4: Obtener Credenciales de la Cuenta de Servicio

1. En Google Cloud Console, ve a "Cuentas de servicio"
2. Selecciona tu cuenta de servicio
3. Ve a "Claves" → "Agregar clave" → "Crear nueva clave"
4. Selecciona JSON y descarga el archivo
5. Del archivo JSON, extrae:
   - `client_email` → `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `private_key` → `GOOGLE_PRIVATE_KEY` (mantén los `\n`)

## ✅ Verificación

Tu `.env.local` debe tener:
```env
GOOGLE_SHEETS_SPREADSHEET_ID=tu_spreadsheet_id_aqui
GOOGLE_SERVICE_ACCOUNT_EMAIL=empeza@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

¡Listo! Tu base de datos está configurada.

