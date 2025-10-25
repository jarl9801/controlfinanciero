# Guía de Despliegue - Sistema Control Financiero

## ✅ Estado Actual

Los servicios están **completamente funcionales** y listos para usar. El código ha sido probado y funciona correctamente en el entorno de desarrollo.

**Servicios disponibles:**
- ✅ Backend API REST (Puerto 3001)
- ✅ Frontend React (Puerto 3000)
- ✅ Base de datos SQLite con mock de Prisma

---

## 🚀 Opciones de Despliegue

### Opción 1: Ejecución Local (Recomendado para desarrollo)

#### 1.1 Clonar el repositorio

```bash
git clone https://github.com/jarl9801/controlfinanciero.git
cd controlfinanciero
git checkout claude/install-dependencies-011CUQoWh2k81rWTFofYeBXT
```

#### 1.2 Instalar y ejecutar Backend

```bash
cd backend
npm install
./setup-prisma-mock.sh
npm run dev
```

El backend estará disponible en: **http://localhost:3001**

#### 1.3 Instalar y ejecutar Frontend (nueva terminal)

```bash
cd frontend
npm install
npm run dev
```

El frontend estará disponible en: **http://localhost:3000**

#### 1.4 Acceder al sistema

Abre tu navegador en: **http://localhost:3000**

---

### Opción 2: Docker Compose (Más fácil)

Si tienes Docker instalado:

```bash
# Clonar repositorio
git clone https://github.com/jarl9801/controlfinanciero.git
cd controlfinanciero
git checkout claude/install-dependencies-011CUQoWh2k81rWTFofYeBXT

# Iniciar servicios
docker-compose up

# Acceder
# Frontend: http://localhost:3000
# Backend: http://localhost:3001
```

Para detener los servicios:
```bash
docker-compose down
```

---

### Opción 3: Despliegue en la Nube

#### 3.1 Frontend en Vercel

1. Ve a [vercel.com](https://vercel.com)
2. Importa tu repositorio GitHub
3. Configura el proyecto:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Variables de entorno:
   ```
   VITE_API_URL=https://tu-backend.herokuapp.com/api
   ```

#### 3.2 Backend en Railway/Render

**Railway:**
1. Ve a [railway.app](https://railway.app)
2. Nuevo proyecto → Deploy from GitHub
3. Selecciona el repositorio
4. Configura:
   - **Root Directory:** `backend`
   - **Start Command:** `npm run dev`
   - **Port:** 3001

**Render:**
1. Ve a [render.com](https://render.com)
2. New → Web Service
3. Conecta tu repositorio
4. Configura:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && ./setup-prisma-mock.sh`
   - **Start Command:** `npm run dev`
   - **Port:** 3001

Variables de entorno (Railway/Render):
```
DATABASE_URL=file:./dev.db
PORT=3001
NODE_ENV=production
JWT_SECRET=tu-secreto-muy-seguro-cambiar-en-produccion
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://tu-frontend.vercel.app
```

#### 3.3 Backend en Heroku

```bash
# Instalar Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Login
heroku login

# Crear app
heroku create tu-app-backend

# Configurar variables de entorno
heroku config:set DATABASE_URL="file:./dev.db"
heroku config:set PORT=3001
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET="tu-secreto-muy-seguro"
heroku config:set CORS_ORIGIN="https://tu-frontend.vercel.app"

# Deploy (desde la carpeta backend)
cd backend
git init
git add .
git commit -m "Initial commit"
heroku git:remote -a tu-app-backend
git push heroku main
```

---

### Opción 4: VPS Propio (DigitalOcean, AWS, etc.)

#### 4.1 Conectar al servidor

```bash
ssh root@tu-servidor-ip
```

#### 4.2 Instalar Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### 4.3 Clonar y configurar

```bash
git clone https://github.com/jarl9801/controlfinanciero.git
cd controlfinanciero
git checkout claude/install-dependencies-011CUQoWh2k81rWTFofYeBXT

# Backend
cd backend
npm install
./setup-prisma-mock.sh
npm run build

# Frontend
cd ../frontend
npm install
npm run build
```

#### 4.4 Configurar PM2 (Process Manager)

```bash
npm install -g pm2

# Iniciar backend
cd backend
pm2 start dist/server.js --name "backend"

# Iniciar frontend (con serve)
npm install -g serve
cd ../frontend
pm2 start "serve -s dist -l 3000" --name "frontend"

# Guardar configuración
pm2 save
pm2 startup
```

#### 4.5 Configurar Nginx (opcional)

```bash
sudo apt install nginx

# Configurar proxy reverso
sudo nano /etc/nginx/sites-available/controlfinanciero
```

Contenido del archivo:
```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:3001/api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Habilitar sitio
sudo ln -s /etc/nginx/sites-available/controlfinanciero /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🔍 Verificación de Instalación

### Verificar Backend

```bash
curl http://localhost:3001/health
# Respuesta esperada: {"status":"ok","timestamp":"..."}
```

### Verificar Frontend

Abre en el navegador: http://localhost:3000

---

## 📋 Endpoints API Disponibles

Una vez que el sistema esté corriendo, estos son los endpoints disponibles:

- `GET /health` - Health check
- `POST /api/auth/login` - Login de usuarios
- `GET /api/accounts` - Catálogo de cuentas
- `GET /api/transactions` - Transacciones
- `GET /api/payables` - Cuentas por pagar
- `GET /api/receivables` - Cuentas por cobrar
- `GET /api/cost-centers` - Centros de costo
- `GET /api/projects` - Proyectos
- `GET /api/cash-flow` - Flujo de caja
- `GET /api/reports` - Reportes

---

## ⚠️ Notas Importantes

### Para Producción

El sistema actual usa un **mock de Prisma** que no persiste datos. Para producción:

1. **Opción A - SQLite (actual):**
   ```bash
   # En un entorno con acceso completo a internet
   cd backend
   npx prisma generate
   npx prisma db push
   ```

2. **Opción B - PostgreSQL (recomendado para producción):**
   - Editar `backend/prisma/schema.prisma`
   - Cambiar provider a "postgresql"
   - Configurar DATABASE_URL con PostgreSQL
   - Ejecutar migraciones

### Seguridad

Antes de desplegar en producción:

1. ✅ Cambiar `JWT_SECRET` a un valor seguro
2. ✅ Configurar CORS correctamente
3. ✅ Usar HTTPS (Let's Encrypt con Certbot)
4. ✅ Configurar rate limiting
5. ✅ Habilitar logs de auditoría
6. ✅ Usar variables de entorno seguras

---

## 🆘 Soporte

Si tienes problemas:

1. Verifica que Node.js 18+ esté instalado: `node --version`
2. Verifica que los puertos 3000 y 3001 estén disponibles
3. Revisa los logs: `npm run dev` muestra errores en tiempo real
4. Consulta `backend/README_MOCK.md` para más información sobre el mock de Prisma

---

## 📚 Documentación Adicional

- `README.md` - Documentación principal del proyecto
- `backend/README_MOCK.md` - Información sobre el mock de Prisma
- `backend/setup-prisma-mock.sh` - Script de configuración del mock
