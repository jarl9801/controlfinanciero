FROM node:18-alpine

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Configurar mock de Prisma
COPY setup-prisma-mock.sh ./
RUN chmod +x setup-prisma-mock.sh && ./setup-prisma-mock.sh

# Copiar código fuente
COPY . .

# Exponer puerto
EXPOSE 3001

# Comando de inicio
CMD ["npm", "run", "dev"]
