# Guía de Configuración de Google Sheets

Esta guía te ayudará a configurar Google Sheets como base de datos para la aplicación Empezá.

## 📋 Requisitos Previos

- Una cuenta de Google
- Acceso a [Google Cloud Console](https://console.cloud.google.com/)
- Un proyecto de Google Cloud (puede ser el mismo que usaste para OAuth)

## 🚀 Pasos para Configurar Google Sheets

### Paso 1: Habilitar Google Sheets API

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto (o crea uno nuevo)
3. Ve a **"APIs y servicios"** > **"Biblioteca"**
4. Busca **"Google Sheets API"**
5. Haz clic en **"Habilitar"**

### Paso 2: Crear una Cuenta de Servicio

1. Ve a **"APIs y servicios"** > **"Credenciales"**
2. Haz clic en **"+ CREAR CREDENCIALES"** > **"Cuenta de servicio"**
3. Completa:
   - **Nombre**: `empeza-sheets-service`
   - **ID**: Se genera automáticamente (puedes dejarlo así)
   - **Descripción**: `Cuenta de servicio para acceso a Google Sheets`
4. Haz clic en **"Crear y continuar"**
5. En **"Otorgar acceso a este proyecto"**: Puedes saltar este paso (haz clic en **"Continuar"**)
6. Haz clic en **"Listo"**

### Paso 3: Crear y Descargar Clave JSON

1. En la lista de cuentas de servicio, haz clic en la que acabas de crear
2. Ve a la pestaña **"Claves"**
3. Haz clic en **"Agregar clave"** > **"Crear nueva clave"**
4. Selecciona **"JSON"**
5. Haz clic en **"Crear"**
6. Se descargará un archivo JSON - **¡GUÁRDALO BIEN!** Contiene información sensible

### Paso 4: Extraer Información del JSON

Abre el archivo JSON descargado. Necesitarás estos valores:

```json
{
  "type": "service_account",
  "project_id": "...",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "empeza-sheets-service@tu-proyecto.iam.gserviceaccount.com",
  ...
}
```

**Valores importantes:**
- `client_email` → Este es tu `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `private_key` → Este es tu `GOOGLE_PRIVATE_KEY` (mantén los `\n`)

### Paso 5: Crear el Google Sheet

1. Ve a [Google Sheets](https://sheets.google.com)
2. Crea un nuevo documento
3. Nómbralo **"Empezá - Base de Datos"**
4. **Copia el ID del spreadsheet** de la URL:
   ```
   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_AQUI/edit
   ```
   El ID es la parte entre `/d/` y `/edit`

### Paso 6: Configurar las Hojas (Sheets)

#### Hoja 1: `routines`

1. Renombra la primera hoja a `routines` (o crea una nueva)
2. En la fila 1, agrega los encabezados:
   ```
   A1: id
   B1: userId
   C1: title
   D1: type
   E1: minValue
   F1: unit
   G1: active
   ```

**Ejemplos de datos:**
- `routine_123 | user@email.com | Leer | quantity | 1 | carilla | TRUE`
- `routine_124 | user@email.com | Ejercicio | time | 10 | min | TRUE`

#### Hoja 2: `daily_logs`

1. Crea una nueva hoja (botón + abajo a la izquierda)
2. Renómbrala a `daily_logs`
3. En la fila 1, agrega los encabezados:
   ```
   A1: id
   B1: routineId
   C1: userId
   D1: date
   E1: completed
   F1: value
   ```

**Nota:** `date` debe estar en formato `YYYY-MM-DD` (ej: `2024-01-15`)

#### Hoja 3: `stats`

1. Crea otra nueva hoja (o actualiza la existente si ya la tenías)
2. Renómbrala a `stats`
3. En la fila 1, agrega los encabezados:
   ```
   A1: userId
   B1: streak
   C1: lastCompletedDate
   ```

**⚠️ Si ya tenías `stats` con `avgDuration`:** Eliminá esa columna, ya no se usa.

### Paso 7: Compartir el Sheet con la Cuenta de Servicio

1. En tu Google Sheet, haz clic en **"Compartir"** (arriba a la derecha)
2. Pega el **email de la cuenta de servicio** (el `client_email` del JSON)
3. Asegúrate de que tenga permisos de **"Editor"**
4. **Desmarca** la opción "Notificar a las personas" (no es necesario)
5. Haz clic en **"Compartir"**

### Paso 8: Configurar Variables de Entorno

Agrega estas variables a tu archivo `.env.local`:

```env
# Google Sheets API
GOOGLE_SHEETS_SPREADSHEET_ID=tu_spreadsheet_id_aqui
GOOGLE_SERVICE_ACCOUNT_EMAIL=empeza-sheets-service@tu-proyecto.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\ntu_private_key_aqui\n-----END PRIVATE KEY-----\n"
```

**⚠️ IMPORTANTE:**
- El `GOOGLE_PRIVATE_KEY` debe estar entre comillas dobles
- Mantén los `\n` en el private key (no los reemplaces con saltos de línea reales)
- El formato debe ser exactamente como aparece en el JSON

### Paso 9: Verificar la Configuración

1. Reinicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```
2. Inicia sesión en la app
3. Crea una rutina en el onboarding
4. Verifica que aparezca en la hoja `routines` de tu Google Sheet

## ✅ Checklist

- [ ] Google Sheets API habilitada
- [ ] Cuenta de servicio creada
- [ ] Clave JSON descargada
- [ ] Google Sheet creado con las 3 hojas (routines, daily_logs, stats)
- [ ] Encabezados agregados en cada hoja
- [ ] Sheet compartido con la cuenta de servicio (permisos de Editor)
- [ ] Variables de entorno configuradas en `.env.local`
- [ ] App funciona correctamente

## 🆘 Solución de Problemas

### Error: "Missing required parameters: spreadsheetId"

- Verifica que `GOOGLE_SHEETS_SPREADSHEET_ID` esté en tu `.env.local`
- Asegúrate de que el ID sea correcto (cópialo de la URL del Sheet)

### Error: "The caller does not have permission"

- Verifica que el Sheet esté compartido con el email de la cuenta de servicio
- Asegúrate de que tenga permisos de **"Editor"** (no solo "Lector")

### Error: "Invalid credentials"

- Verifica que `GOOGLE_SERVICE_ACCOUNT_EMAIL` y `GOOGLE_PRIVATE_KEY` estén correctos
- Asegúrate de que el `private_key` esté entre comillas dobles y mantenga los `\n`

### Error: "Unable to parse range"

- Verifica que las hojas se llamen exactamente: `tasks`, `timeboxes`, `stats`
- Verifica que los encabezados estén en la fila 1

## 📚 Recursos Adicionales

- [Google Sheets API Documentation](https://developers.google.com/sheets/api)
- [Service Account Documentation](https://cloud.google.com/iam/docs/service-accounts)
