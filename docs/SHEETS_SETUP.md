# ⚡ Configuración Rápida - Google Sheets

## 🎯 Configuración en 10 minutos

### 1️⃣ Habilitar Google Sheets API

1. Ve a: https://console.cloud.google.com/
2. Selecciona tu proyecto
3. Ve a **"APIs y servicios"** > **"Biblioteca"**
4. Busca **"Google Sheets API"** y haz clic en **"Habilitar"**

### 2️⃣ Crear Cuenta de Servicio

1. Ve a **"APIs y servicios"** > **"Credenciales"**
2. Clic en **"+ CREAR CREDENCIALES"** > **"Cuenta de servicio"**
3. Nombre: `empeza-sheets-service`
4. Clic en **"Crear y continuar"** > **"Continuar"** > **"Listo"**

### 3️⃣ Descargar Clave JSON

1. Haz clic en la cuenta de servicio creada
2. Ve a **"Claves"** > **"Agregar clave"** > **"Crear nueva clave"**
3. Selecciona **"JSON"** y haz clic en **"Crear"**
4. Se descargará un archivo JSON - **guárdalo**

### 4️⃣ Crear Google Sheet

1. Ve a: https://sheets.google.com
2. Crea un nuevo documento: **"Empezá - Base de Datos"**
3. **Copia el ID** de la URL:
   ```
   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
   ```

### 5️⃣ Configurar las Hojas

**Hoja 1: `users`** (se crea automáticamente, pero puedes crearla manualmente)
```
A1: id
B1: email
C1: passwordHash
D1: createdAt
```

**Hoja 2: `routines`** (renombra la primera hoja o crea nueva)
```
A1: id
B1: userId
C1: title
D1: type
E1: minValue
F1: unit
G1: active
```

**Hoja 3: `daily_logs`** (crea nueva hoja)
```
A1: id
B1: routineId
C1: userId
D1: date
E1: completed
F1: value
```

**Hoja 4: `stats`** (crea nueva hoja o actualiza la existente)
```
A1: userId
B1: streak
C1: lastCompletedDate
```

**⚠️ Nota:** Si ya tenías hojas `tasks` y `timeboxes`, necesitás crear las nuevas. Ver `docs/migration-guide.md` para más detalles.

### 6️⃣ Compartir con Cuenta de Servicio

1. En el Sheet, haz clic en **"Compartir"**
2. Pega el **email de la cuenta de servicio** (del JSON: `client_email`)
3. Permisos: **"Editor"**
4. Clic en **"Compartir"**

### 7️⃣ Configurar .env.local

Abre el JSON descargado y agrega a `.env.local`:

```env
GOOGLE_SHEETS_SPREADSHEET_ID=el_id_del_sheet
GOOGLE_SERVICE_ACCOUNT_EMAIL=el_client_email_del_json
GOOGLE_PRIVATE_KEY="el_private_key_del_json_completo_con_comillas"
```

**Ejemplo:**
```env
GOOGLE_SHEETS_SPREADSHEET_ID=1a2b3c4d5e6f7g8h9i0j
GOOGLE_SERVICE_ACCOUNT_EMAIL=empeza-sheets-service@mi-proyecto.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
```

### 8️⃣ Verificar

1. Reinicia el servidor: `npm run dev`
2. Inicia sesión y crea una tarea
3. Verifica que aparezca en el Google Sheet

## ✅ Checklist

- [ ] Google Sheets API habilitada
- [ ] Cuenta de servicio creada
- [ ] Clave JSON descargada
- [ ] Google Sheet creado con 4 hojas (users, routines, daily_logs, stats)
- [ ] Encabezados configurados
- [ ] Sheet compartido con cuenta de servicio
- [ ] Variables agregadas a `.env.local`
- [ ] App funciona correctamente

## 📖 Guía Completa

Para más detalles: [docs/google-sheets-setup.md](./docs/google-sheets-setup.md)
