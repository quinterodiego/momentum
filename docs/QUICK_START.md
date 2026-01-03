# ⚡ Inicio Rápido - Google OAuth

## 🎯 Configuración en 5 minutos

### 1️⃣ Configurar Pantalla de Consentimiento OAuth (OBLIGATORIO)

**⚠️ IMPORTANTE: Debes hacer esto ANTES de crear las credenciales**

1. Ve a: https://console.cloud.google.com/
2. Crea un proyecto nuevo o selecciona uno existente
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

### 2️⃣ Crear Credenciales OAuth

1. Ve a **"APIs y servicios"** > **"Credenciales"**
2. Clic en **"+ CREAR CREDENCIALES"** > **"ID de cliente de OAuth"**
3. Configura:
   - Tipo: **Aplicación web**
   - Nombre: `Empezá Web Client`
   - Orígenes autorizados: `http://localhost:3000`
   - URI de redirección: `http://localhost:3000/api/auth/callback/google`
4. **Copia** el ID de cliente y el Secreto de cliente

### 3️⃣ Crear archivo .env.local

En la raíz del proyecto, crea `.env.local`:

```env
GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-tu_secreto_aqui
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=genera_con_openssl_rand_base64_32
```

### 4️⃣ Generar NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

Copia el resultado y pégalo en `NEXTAUTH_SECRET`

### 5️⃣ Verificar configuración

```bash
npm run check-env
```

### 6️⃣ Iniciar la app

```bash
npm run dev
```

Ve a `http://localhost:3000` y prueba el login.

## ✅ Checklist

- [ ] Pantalla de consentimiento OAuth configurada
- [ ] Usuario de prueba agregado (tu email)
- [ ] Credenciales OAuth creadas en Google Cloud Console
- [ ] Archivo `.env.local` creado con todas las variables
- [ ] `NEXTAUTH_SECRET` generado
- [ ] `npm run check-env` pasa sin errores
- [ ] Login funciona correctamente

## 🆘 Problemas Comunes

**Error: redirect_uri_mismatch**
- Verifica que la URL en Google Cloud Console sea exactamente: `http://localhost:3000/api/auth/callback/google`

**Error: invalid_client**
- Verifica que no haya espacios extra en `.env.local`
- Reinicia el servidor después de cambiar variables

## 📖 Guía Completa

Para más detalles, consulta: [docs/google-oauth-setup.md](./docs/google-oauth-setup.md)

