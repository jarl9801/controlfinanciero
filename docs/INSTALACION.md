# Guía de Instalación

## Requisitos Previos

### Software Requerido
- **Node.js** 18.x o superior
- **PostgreSQL** 14.x o superior
- **npm** o **yarn**
- **Git**

### Verificar Instalación

```bash
node --version    # v18.0.0 o superior
npm --version     # 9.0.0 o superior
psql --version    # 14.0 o superior
```

## Instalación Paso a Paso

### 1. Clonar el Repositorio

```bash
git clone <repository-url>
cd controlfinanciero
```

### 2. Configurar Base de Datos

#### Crear Base de Datos en PostgreSQL

```bash
# Conectar a PostgreSQL
psql -U postgres

# Crear base de datos
CREATE DATABASE controlfinanciero;

# Crear usuario (opcional)
CREATE USER finanzas_user WITH PASSWORD 'tu-password-seguro';
GRANT ALL PRIVILEGES ON DATABASE controlfinanciero TO finanzas_user;
```

### 3. Configurar Backend

```bash
cd backend

# Instalar dependencias
npm install

# Copiar archivo de ambiente
cp .env.example .env

# Editar .env con tus configuraciones
nano .env
```

#### Configurar .env

```env
# Base de Datos
DATABASE_URL="postgresql://finanzas_user:tu-password@localhost:5432/controlfinanciero"

# Servidor
PORT=3001
NODE_ENV=development

# Autenticación
JWT_SECRET=genera-un-secreto-aleatorio-muy-seguro
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000
```

**Generar JWT_SECRET seguro**:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### Ejecutar Migraciones y Seed

```bash
# Generar cliente Prisma
npm run prisma:generate

# Ejecutar migraciones
npm run prisma:migrate

# Cargar datos iniciales
npm run prisma:seed
```

### 4. Configurar Frontend

```bash
cd ../frontend

# Instalar dependencias
npm install

# Copiar archivo de ambiente
cp .env.example .env

# Editar .env
nano .env
```

#### Configurar .env del Frontend

```env
VITE_API_URL=http://localhost:3001/api
```

### 5. Iniciar Aplicación

#### Opción A: Iniciar Backend y Frontend por Separado

**Terminal 1 - Backend**:
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend**:
```bash
cd frontend
npm run dev
```

#### Opción B: Iniciar Ambos desde la Raíz

```bash
# Desde la raíz del proyecto
npm run dev:backend   # Terminal 1
npm run dev:frontend  # Terminal 2
```

### 6. Acceder a la Aplicación

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **Prisma Studio**: `npm run prisma:studio` (herramienta visual para DB)

### 7. Credenciales Iniciales

Después del seed, puedes acceder con:

- **Email**: admin@controlfinanciero.com
- **Password**: admin123

**⚠️ IMPORTANTE**: Cambiar estas credenciales en producción.

## Verificación de Instalación

### Probar Backend

```bash
# Health check
curl http://localhost:3001/health

# Debería retornar:
# {"status":"ok","timestamp":"2024-01-15T..."}
```

### Probar Frontend

Abrir navegador en http://localhost:3000 y verificar que:
- El dashboard carga sin errores
- El menú lateral funciona
- Se pueden navegar las diferentes secciones

## Problemas Comunes

### Error: "Cannot connect to database"

**Solución**:
1. Verificar que PostgreSQL esté corriendo: `sudo service postgresql status`
2. Verificar credenciales en DATABASE_URL
3. Verificar que la base de datos exista: `psql -l`

### Error: "Port 3001 already in use"

**Solución**:
```bash
# Encontrar proceso usando el puerto
lsof -ti:3001

# Matar el proceso
kill -9 <PID>

# O cambiar el puerto en .env
PORT=3002
```

### Error: "Module not found"

**Solución**:
```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### Error de Prisma: "Migration failed"

**Solución**:
```bash
# Resetear base de datos (CUIDADO: borra todos los datos)
npm run prisma:migrate reset

# O aplicar migraciones manualmente
npx prisma migrate deploy
```

## Instalación en Producción

### 1. Variables de Entorno

Configurar variables de producción:

```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@production-host:5432/db
JWT_SECRET=<secreto-aleatorio-muy-seguro>
CORS_ORIGIN=https://tu-dominio.com
```

### 2. Build

```bash
# Backend
cd backend
npm run build
npm run prisma:migrate

# Frontend
cd frontend
npm run build
```

### 3. Despliegue

#### Backend (con PM2)
```bash
npm install -g pm2
pm2 start dist/server.js --name controlfinanciero-api
pm2 save
pm2 startup
```

#### Frontend (con Nginx)
```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    root /path/to/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 4. Seguridad en Producción

- [ ] Cambiar credenciales por defecto
- [ ] Habilitar HTTPS
- [ ] Configurar firewall
- [ ] Habilitar rate limiting
- [ ] Configurar backups automáticos
- [ ] Configurar monitoreo
- [ ] Revisar logs regularmente

## Scripts Disponibles

### Backend

```bash
npm run dev           # Modo desarrollo
npm run build         # Compilar TypeScript
npm start             # Iniciar producción
npm run prisma:generate   # Generar cliente
npm run prisma:migrate    # Ejecutar migraciones
npm run prisma:studio     # Abrir Prisma Studio
npm run prisma:seed       # Cargar datos iniciales
npm test              # Ejecutar tests
```

### Frontend

```bash
npm run dev           # Modo desarrollo
npm run build         # Build de producción
npm run preview       # Preview del build
npm run lint          # Linter
```

## Siguientes Pasos

1. Revisar la [Documentación de Arquitectura](./ARQUITECTURA.md)
2. Revisar la [Documentación de API](./API.md)
3. Personalizar el plan de cuentas según tu empresa
4. Configurar centros de costo
5. Crear usuarios adicionales
6. Importar datos históricos (si aplica)

## Soporte

Para problemas o preguntas:
- Revisar la documentación completa
- Verificar los logs: `tail -f backend/logs/error.log`
- Contactar al equipo de desarrollo
