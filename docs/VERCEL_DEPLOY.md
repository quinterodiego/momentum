# 🚀 Guía de Deploy en Vercel

## Prerrequisitos

1. Cuenta en [Vercel](https://vercel.com)
2. Repositorio en GitHub (ya configurado: `quinterodiego/momentum`)
3. Google Sheets configurado (ver `docs/SHEETS_SETUP.md`)
4. Google OAuth configurado (ver `docs/google-oauth-setup.md`)

## Pasos para Deploy

### 1. Conectar el Repositorio

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Haz clic en **"Add New Project"**
3. Importa el repositorio `quinterodiego/momentum`
4. Vercel detectará automáticamente que es un proyecto Next.js

### 2. Configurar Variables de Entorno

En la configuración del proyecto, agrega las siguientes variables de entorno:

#### Variables Requeridas

```env
# Google Sheets
GOOGLE_SHEETS_SPREADSHEET_ID=tu_spreadsheet_id
GOOGLE_SERVICE_ACCOUNT_EMAIL=tu_service_account_email
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# NextAuth
NEXTAUTH_URL=https://tu-dominio.vercel.app
NEXTAUTH_SECRET=genera_un_secreto_aleatorio_aqui

# Google OAuth
GOOGLE_CLIENT_ID=tu_google_client_id
GOOGLE_CLIENT_SECRET=tu_google_client_secret
```

#### Cómo obtener los valores:

- **GOOGLE_SHEETS_SPREADSHEET_ID**: ID del Google Sheet (de la URL)
- **GOOGLE_SERVICE_ACCOUNT_EMAIL**: Email de la cuenta de servicio (del JSON descargado)
- **GOOGLE_PRIVATE_KEY**: Private key del JSON (mantén los `\n`)
- **NEXTAUTH_URL**: URL de tu app en Vercel (se actualiza después del primer deploy)
- **NEXTAUTH_SECRET**: Genera uno con: `openssl rand -base64 32`
- **GOOGLE_CLIENT_ID** y **GOOGLE_CLIENT_SECRET**: De Google Cloud Console

### 3. Configurar Build Settings

Vercel debería detectar automáticamente:
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 4. Deploy Inicial

1. Haz clic en **"Deploy"**
2. Espera a que termine el build
3. **Copia la URL de tu app** (ej: `https://momentum-abc123.vercel.app`)

### 5. ⚠️ IMPORTANTE: Configurar Google Cloud Console

**Este paso es CRÍTICO para que el login con Google funcione en producción.**

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto
3. Ve a **"APIs y servicios"** > **"Credenciales"**
4. Haz clic en tu **ID de cliente de OAuth** (el que creaste para desarrollo)
5. En la sección **"Orígenes autorizados de JavaScript"**, agrega:
   ```
   https://tu-dominio.vercel.app
   ```
   (Reemplaza `tu-dominio.vercel.app` con la URL real de Vercel)

6. En la sección **"URI de redirección autorizados"**, agrega:
   ```
   https://tu-dominio.vercel.app/api/auth/callback/google
   ```
   (Mantén también `http://localhost:3000/api/auth/callback/google` para desarrollo local)

7. Haz clic en **"Guardar"**

### 6. Actualizar Variables de Entorno

1. En Vercel, ve a **Settings** > **Environment Variables**
2. Actualiza **NEXTAUTH_URL** con la URL real de Vercel:
   ```
   NEXTAUTH_URL=https://tu-dominio.vercel.app
   ```
3. Haz un nuevo deploy para aplicar los cambios

### 7. Configurar Dominio Personalizado (Opcional)

Si agregas un dominio personalizado:

1. En Vercel, ve a **Settings** > **Domains**
2. Agrega tu dominio personalizado
3. Sigue las instrucciones de DNS
4. **IMPORTANTE**: Una vez configurado, agrega también este dominio en Google Cloud Console:
   - **Orígenes autorizados**: `https://tu-dominio.com`
   - **URI de redirección**: `https://tu-dominio.com/api/auth/callback/google`
5. Actualiza **NEXTAUTH_URL** en Vercel con el nuevo dominio

## Verificación Post-Deploy

1. ✅ Verifica que la landing page carga correctamente
2. ✅ Prueba el registro de usuarios
3. ✅ Prueba el login con email y Google
4. ✅ Verifica que las rutinas se crean en Google Sheets
5. ✅ Prueba completar una rutina

## Troubleshooting

### Error: "Google Sheets no está configurado"
- Verifica que todas las variables de entorno estén configuradas
- Asegúrate de que `GOOGLE_PRIVATE_KEY` tenga los `\n` correctos

### Error: "NEXTAUTH_SECRET is missing"
- Genera un nuevo secreto: `openssl rand -base64 32`
- Agrégalo a las variables de entorno

### Error: "Invalid redirect URI" o "redirect_uri_mismatch"
- **Solución**: Ve a Google Cloud Console > Credenciales > Tu OAuth Client
- Agrega la URL exacta de Vercel en "URI de redirección autorizados
- Formato: `https://tu-dominio.vercel.app/api/auth/callback/google`
- **IMPORTANTE**: 
  - Debe ser exactamente igual (con `https://`, sin barra final `/`)
  - Debes hacer clic en "Guardar" después de agregar
  - Puede tardar unos minutos en aplicarse

### Build falla
- Verifica que todas las dependencias estén en `package.json`
- Revisa los logs de build en Vercel

## Variables de Entorno en Vercel

Para agregar variables de entorno en Vercel:

1. Ve a tu proyecto en Vercel
2. **Settings** > **Environment Variables**
3. Agrega cada variable con su valor
4. Selecciona los ambientes (Production, Preview, Development)
5. Guarda y haz un nuevo deploy

## Notas Importantes

- ⚠️ **Nunca** subas el archivo `momentum-*.json` al repositorio
- ⚠️ **Nunca** subas archivos `.env` al repositorio
- ✅ El archivo `.gitignore` ya está configurado para excluir estos archivos
- ✅ Vercel usa variables de entorno, no archivos `.env`

## Actualizar después de cambios

Cada vez que hagas push a `main`, Vercel automáticamente:
1. Detecta los cambios
2. Hace un nuevo build
3. Deploya la nueva versión

Para cambios en variables de entorno:
1. Actualiza las variables en Vercel
2. Haz un nuevo deploy manual o espera al siguiente push
