# Configuración Mock de Prisma

## Problema

En entornos con restricciones de red, los binarios de Prisma no se pueden descargar desde `binaries.prisma.sh`, lo que impide la generación del cliente de Prisma y el funcionamiento del backend.

## Solución: Mock de Prisma Client

Se ha creado un mock del cliente de Prisma que permite que el backend funcione sin necesidad de descargar binarios. Este mock:

- ✅ Permite que el servidor arranque correctamente
- ✅ Responde a todas las operaciones con datos vacíos/default
- ✅ Mantiene la interfaz compatible con Prisma Client
- ⚠️ **NO persiste datos** (solo para desarrollo/testing)

## Uso

### Configurar el mock

```bash
cd backend
./setup-prisma-mock.sh
```

### Iniciar el servidor

```bash
npm run dev
```

El servidor se iniciará en `http://localhost:3001` con el siguiente mensaje:

```
✅ Mock Prisma Client connected (no real database)
✅ Database connected
🚀 Server running on port 3001
```

## Para Producción

Para un entorno de producción real necesitas:

### Opción 1: SQLite (actual configuración)

1. Asegurarte de tener acceso a internet para descargar los binarios de Prisma
2. Ejecutar:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

### Opción 2: PostgreSQL (configuración original)

1. Instalar PostgreSQL
2. Editar `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
3. Actualizar `.env`:
   ```
   DATABASE_URL="postgresql://usuario:password@localhost:5432/controlfinanciero"
   ```
4. Ejecutar:
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

## Notas

- El mock se recrea automáticamente con cada `npm install`
- No requiere base de datos real
- Ideal para desarrollo frontend y testing de endpoints
- Todos los endpoints devuelven arrays vacíos o valores por defecto
