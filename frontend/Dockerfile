FROM node:20-alpine AS build
WORKDIR /app

ARG VITE_API_URL=http://localhost:8080
ENV VITE_API_URL=${VITE_API_URL}

COPY package*.json ./
RUN npm install --no-audit --no-fund

COPY . .
RUN npm run build

FROM nginx:1.27-alpine AS final
WORKDIR /usr/share/nginx/html

COPY --from=build /app/dist .
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
