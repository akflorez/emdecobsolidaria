# Stage 1: Construcción del bundle estático con Node 22
FROM node:22-alpine AS build
WORKDIR /app

# Copiar paquetes e instalar dependencias de producción
COPY package*.json ./
RUN npm ci

# Copiar todo el código fuente y construir la aplicación
COPY . .
RUN npm run build

# Stage 2: Servidor Nginx liviano para servir la SPA y PWA
FROM nginx:alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
