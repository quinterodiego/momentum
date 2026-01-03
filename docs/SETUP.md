# 🚀 Guía de Configuración Rápida - Empezá

## Configuración de Google OAuth (Login)

### Paso 1: Configurar Pantalla de Consentimiento OAuth (OBLIGATORIO)

**⚠️ IMPORTANTE: Debes hacer esto ANTES de crear las credenciales**

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Ve a **"APIs y servicios"** > **"Pantalla de consentimiento OAuth"**
4. Selecciona **"Externo"** (para desarrollo) y haz clic en **"Crear"**
5. Completa la información:
   - **Nombre de la app**: `Empezá`
   - **Email de soporte**: Tu email
   - **Email del desarrollador**: Tu email (selecciónalo de la lista)
6. Haz clic en **"Guardar y continuar"**
7. En **"Scopes"**: Haz clic en **"Guardar y continuar"** (no necesitas agregar scopes)
8. En **"Usuarios de prueba"**: 
   - Haz clic en **"+ AGREGAR USUARIOS"**
   - Agrega tu email de Google
   - Haz clic en **"Guardar y continuar"**
9. Revisa y haz clic en **"Volver al panel"**

### Paso 2: Crear Credenciales en Google Cloud Console

1. Ve a **"APIs y servicios"** > **"Credenciales"**
2. Haz clic en **"+ CREAR CREDENCIALES"** > **"ID de cliente de OAuth"**
3. Configura:
   - **Tipo**: Aplicación web
   - **Nombre**: Empezá Web Client
   - **Orígenes autorizados**: `http://localhost:3000`
   - **URI de redirección**: `http://localhost:3000/api/auth/callback/google`
4. Copia el **ID de cliente** y el **Secreto de cliente**

### Paso 3: Crear archivo .env.local

En la raíz del proyecto, crea un archivo `.env.local` con:

```env
# Google OAuth
GOOGLE_CLIENT_ID=tu_client_id_aqui.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu_client_secret_aqui

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=genera_un_secret_aleatorio
```

### Paso 4: Generar NEXTAUTH_SECRET

Ejecuta en tu terminal:

```bash
openssl rand -base64 32
```

Copia el resultado y úsalo como `NEXTAUTH_SECRET` en tu `.env.local`

### Paso 5: Verificar

1. Reinicia el servidor: `npm run dev`
2. Ve a `http://localhost:3000`
3. Haz clic en "Arrancar" y deberías ver el login de Google

## 📚 Guía Completa

Para una guía detallada paso a paso, consulta: [docs/google-oauth-setup.md](./docs/google-oauth-setup.md)

