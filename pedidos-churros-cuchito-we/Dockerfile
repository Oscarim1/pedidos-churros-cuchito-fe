# 1. Build la app Next.js exportada
FROM node:20-alpine as builder

WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

# 2. Usa nginx para servir lo estático
FROM nginx:alpine
COPY --from=builder /app/out /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
