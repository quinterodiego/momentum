# Empezá - App Anti-procrastinación

Aplicación de productividad basada en el método **Timeboxing adaptativo**, donde **cumplir el tiempo es éxito, no terminar la tarea**.

## 🎯 Principio Fundamental

> **Cumplir el tiempo es éxito, no terminar la tarea.**

Toda la app respeta esta regla. El objetivo es reducir la fricción y hacer que empezar sea fácil.

## 🧠 Concepto Clave

Cada tarea se divide en acciones mínimas ejecutadas en timeboxes adaptativos de:
- 3 min
- 5 min
- 10 min
- 15 min

Nunca se muestran tareas grandes completas.

## 🧱 Estructura de Datos (Google Sheets)

### Sheet: `tasks`
| id | userId | title | active | createdAt |

### Sheet: `timeboxes`
| id | userId | taskId | duration | status | startedAt | endedAt |

`status`: `completed` | `abandoned`

### Sheet: `stats`
| userId | streak | lastCompletedAt | avgDuration |

## 🧠 Lógica de Timeboxing Adaptativo

- **Si abandona 2 timeboxes seguidos**: reducir duración (mínimo 3 min)
- **Si completa 3 timeboxes seguidos**: aumentar duración (máximo 15 min)
- **Si abandona uno**: no penalizar
- **Nunca castigar al usuario**

## 🚀 Configuración

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar Google OAuth

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la API de Google Sheets
4. Crea credenciales OAuth 2.0 para la aplicación web
5. Agrega `http://localhost:3000/api/auth/callback/google` como URL de redirección autorizada

### 3. Configurar Google Sheets API

1. Crea una cuenta de servicio en Google Cloud Console
2. Descarga el archivo JSON de credenciales
3. Comparte tu Google Sheet con el email de la cuenta de servicio
4. Crea un Google Sheet con tres hojas: `tasks`, `timeboxes`, `stats`
5. Agrega los encabezados en la primera fila de cada hoja:

**tasks:**
```
id | userId | title | active | createdAt
```

**timeboxes:**
```
id | userId | taskId | duration | status | startedAt | endedAt
```

**stats:**
```
userId | streak | lastCompletedAt | avgDuration
```

### 4. Configurar variables de entorno

Copia `.env.local.example` a `.env.local` y completa:

```env
GOOGLE_CLIENT_ID=tu_client_id
GOOGLE_CLIENT_SECRET=tu_client_secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu_secret_aleatorio

GOOGLE_SHEETS_SPREADSHEET_ID=tu_spreadsheet_id
GOOGLE_SERVICE_ACCOUNT_EMAIL=tu_service_account_email
GOOGLE_PRIVATE_KEY=tu_private_key
```

Para generar `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

### 5. Ejecutar la aplicación

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📁 Estructura del Proyecto

```
├── app/
│   ├── actions/          # Server Actions
│   ├── api/              # API routes (NextAuth)
│   ├── dashboard/        # Pantalla principal
│   ├── focus/            # Pantalla de enfoque
│   └── layout.tsx        # Layout principal
├── components/           # Componentes React
├── lib/
│   ├── sheets.ts         # Integración con Google Sheets
│   ├── timeboxing.ts     # Lógica de timeboxing adaptativo
│   └── types.ts          # Tipos TypeScript
└── package.json
```

## 🧩 Funcionalidades

### Dashboard (`/dashboard`)
- CTA principal: "Estoy procrastinando"
- Muestra tarea activa
- Estadísticas básicas (racha, promedio)
- Mensajes motivacionales según hora del día

### Focus Mode (`/focus`)
- Timer visible con cuenta regresiva
- Muestra una sola acción mínima
- No se puede pausar
- Solo opciones: Completar o Abandonar
- Auto-completa cuando llega a 0

## 🧠 Copy y UX

La app usa mensajes amables y sin culpa:
- "Solo 5 minutos, después decidís"
- "Cumpliste el tiempo, eso alcanza"
- "Parar también es progreso"

Nunca usa lenguaje de culpa o presión.

## 🛠️ Tecnologías

- **Next.js 14** (App Router)
- **TypeScript**
- **NextAuth.js** (Google OAuth)
- **Google Sheets API** (Base de datos)
- **Server Actions** (Operaciones del servidor)

## 📝 Notas

- Todas las operaciones de base de datos se ejecutan en el servidor
- No se usa Redux ni estado global complejo
- El código está comentado y separado por responsabilidades
- Google Sheets es la única base de datos

## 🔥 Próximos Pasos (Extras)

- [ ] Mensajes según hora del día (ya implementado)
- [ ] Historial visual de timeboxes
- [ ] Estadísticas más detalladas (sin abrumar)

