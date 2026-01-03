# Guía de Configuración de Google OAuth

Esta guía te ayudará a configurar el login con Google para la aplicación Empezá.

## 📋 Requisitos Previos

- Una cuenta de Google
- Acceso a [Google Cloud Console](https://console.cloud.google.com/)

## 🚀 Pasos para Configurar Google OAuth

### Paso 1: Crear un Proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Haz clic en el selector de proyectos (arriba a la izquierda)
3. Haz clic en **"Nuevo Proyecto"**
4. Ingresa un nombre para tu proyecto (ej: "Empezá App")
5. Haz clic en **"Crear"**
6. Espera a que se cree el proyecto y selecciónalo

### Paso 2: Configurar Pantalla de Consentimiento OAuth

**⚠️ IMPORTANTE: Este paso es OBLIGATORIO y debe hacerse ANTES de crear las credenciales OAuth**

1. Ve a **"APIs y servicios"** > **"Pantalla de consentimiento OAuth"**
2. Selecciona **"Externo"** (para desarrollo) o **"Interno"** (si tienes Google Workspace)
3. Haz clic en **"Crear"**
4. Completa la información:
   - **Nombre de la app**: Empezá
   - **Email de soporte**: Tu email
   - **Email del desarrollador**: Tu email
5. Haz clic en **"Guardar y continuar"**
6. En **"Scopes"**, haz clic en **"Guardar y continuar"** (no necesitas agregar scopes adicionales)
7. En **"Usuarios de prueba"**, agrega tu email si es necesario
8. Haz clic en **"Guardar y continuar"**
9. Revisa y haz clic en **"Volver al panel"**

### Paso 3: Habilitar Google+ API (Opcional)

1. En el menú lateral, ve a **"APIs y servicios"** > **"Biblioteca"**
2. Busca **"Google+ API"** o **"Google Identity Services"**
3. Haz clic en **"Habilitar"**

> **Nota**: Para login básico con NextAuth, esto no es estrictamente necesario, pero puede ayudar.

### Paso 4: Crear Credenciales OAuth 2.0

1. Ve a **"APIs y servicios"** > **"Credenciales"**
2. Haz clic en **"+ CREAR CREDENCIALES"** > **"ID de cliente de OAuth"**
3. Selecciona **"Aplicación web"** como tipo de aplicación
4. Configura:
   - **Nombre**: Empezá Web Client
   - **Orígenes autorizados de JavaScript**:
     ```
     http://localhost:3000
     ```
   - **URI de redirección autorizados**:
     ```
     http://localhost:3000/api/auth/callback/google
     ```
5. Haz clic en **"Crear"**
6. **¡IMPORTANTE!** Copia los valores:
   - **ID de cliente** → Este es tu `GOOGLE_CLIENT_ID`
   - **Secreto de cliente** → Este es tu `GOOGLE_CLIENT_SECRET`
   - ⚠️ El secreto solo se muestra una vez, guárdalo bien

### Paso 5: Configurar Variables de Entorno

1. En la raíz del proyecto, crea un archivo `.env.local` (si no existe)
2. Copia el contenido de `.env.local.example`
3. Completa los valores:

```env
GOOGLE_CLIENT_ID=tu_id_de_cliente_aqui.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu_secreto_de_cliente_aqui
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=genera_un_secret_aleatorio
```

### Paso 6: Generar NEXTAUTH_SECRET

Ejecuta en tu terminal:

```bash
openssl rand -base64 32
```

Copia el resultado y úsalo como `NEXTAUTH_SECRET` en tu `.env.local`

### Paso 7: Verificar la Configuración

1. Reinicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```
2. Ve a `http://localhost:3000`
3. Haz clic en **"Arrancar"** (botón de login)
4. Deberías ver la pantalla de login de Google
5. Inicia sesión con tu cuenta de Google
6. Acepta los permisos
7. Deberías ser redirigido a la app

## 🔧 Configuración para Producción

Cuando despliegues a producción (Vercel, Netlify, etc.):

1. En Google Cloud Console, agrega tu dominio de producción:
   - **Orígenes autorizados**: `https://tu-dominio.com`
   - **URI de redirección**: `https://tu-dominio.com/api/auth/callback/google`

2. Actualiza `NEXTAUTH_URL` en las variables de entorno de producción:
   ```
   NEXTAUTH_URL=https://tu-dominio.com
   ```

## ❌ Solución de Problemas

### Error: "redirect_uri_mismatch"

- Verifica que la URI de redirección en Google Cloud Console coincida exactamente con la URL de tu app
- Asegúrate de incluir `http://` o `https://` según corresponda
- No incluyas una barra final (`/`) al final de la URL

### Error: "invalid_client"

- Verifica que `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` estén correctos
- Asegúrate de que no haya espacios extra en el `.env.local`
- Reinicia el servidor después de cambiar las variables de entorno

### Error: "access_denied"

- Verifica que tu email esté en la lista de "Usuarios de prueba" si la app está en modo de prueba
- O publica la app en Google Cloud Console

## 📚 Recursos Adicionales

- [Documentación de NextAuth.js](https://next-auth.js.org/providers/google)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)

