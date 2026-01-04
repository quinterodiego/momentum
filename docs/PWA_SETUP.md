# Configuración PWA - Momentum

## ✅ Lo que ya está hecho

1. **Manifest.json** - Configurado en `/public/manifest.json`
2. **Service Worker** - Creado en `/public/sw.js`
3. **Registro del SW** - Componente creado en `/components/ServiceWorkerRegistration.tsx
4. **Metadatos PWA** - Configurados en `app/layout.tsx`

## 📋 Lo que necesitás hacer

### 1. Crear los iconos de PWA

Necesitás crear dos iconos PNG en la carpeta `/public`:

- **`icon-192x192.png`** - Icono de 192x192 píxeles
- **`icon-512x512.png`** - Icono de 512x512 píxeles

**Opciones para crear los iconos:**

1. **Usar una herramienta online:**
   - [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator)
   - [RealFaviconGenerator](https://realfavicongenerator.net/)
   - [PWA Builder](https://www.pwabuilder.com/imageGenerator)

2. **Usar el cubo.png existente:**
   - Podés usar `/public/cubo.png` como base
   - Redimensionarlo a 192x192 y 512x512
   - Asegurate de que tenga fondo transparente o del color que quieras

3. **Requisitos de los iconos:**
   - Formato: PNG
   - Tamaños: 192x192px y 512x512px
   - Preferiblemente con fondo transparente o sólido
   - Deben ser cuadrados (1:1 aspect ratio)

### 2. Verificar que todo funcione

1. **Build de producción:**
   ```bash
   npm run build
   npm start
   ```

2. **Probar en el navegador:**
   - Abrí la app en Chrome/Edge
   - Abrí DevTools (F12) → Application → Service Workers
   - Verificá que el service worker esté registrado
   - Verificá que el manifest esté cargado en Application → Manifest

3. **Probar instalación:**
   - En Chrome/Edge, deberías ver un ícono de "Instalar" en la barra de direcciones
   - O podés ir a Menú → "Instalar Momentum..."

### 3. (Opcional) Personalizar el Service Worker

Si querés ajustar qué se cachea o la estrategia de caché, editá `/public/sw.js`.

**Estrategia actual:** Network First (intenta red primero, luego cache)

## 🎯 Características PWA habilitadas

- ✅ Instalable en dispositivos móviles y desktop
- ✅ Funciona offline (con cache)
- ✅ Icono en la pantalla de inicio
- ✅ Pantalla de splash personalizada
- ✅ Tema de color personalizado (#2ECC71 - verde)

## 📱 Probar en móvil

1. Desplegá la app en producción (Vercel)
2. Abrí la URL en tu móvil
3. En Android: Chrome mostrará un banner "Agregar a pantalla de inicio"
4. En iOS: Safari → Compartir → "Agregar a pantalla de inicio"

## 🔧 Troubleshooting

**El service worker no se registra:**
- Verificá que estés en HTTPS o localhost
- Revisá la consola del navegador para errores

**Los iconos no aparecen:**
- Verificá que los archivos estén en `/public/`
- Verificá que los nombres coincidan con `manifest.json`
- Limpiá el cache del navegador

**La app no se puede instalar:**
- Verificá que el manifest.json sea válido
- Asegurate de estar en HTTPS (requerido para PWA en producción)
