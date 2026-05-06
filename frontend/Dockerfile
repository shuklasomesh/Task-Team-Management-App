# -- Stage 1: Build React app --
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# -- Stage 2: Serve with nginx + envsubst support --
FROM nginx:alpine
RUN apk add --no-cache bash

COPY --from=build /app/dist /usr/share/nginx/html

# Store nginx config as a TEMPLATE (envsubst fills in $BACKEND_URL at runtime)
COPY nginx.conf /etc/nginx/conf.d/default.conf.template
RUN sed -i 's/\r$//' /etc/nginx/conf.d/default.conf.template

# Entrypoint script runs envsubst then starts nginx
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN sed -i 's/\r$//' /docker-entrypoint.sh && chmod +x /docker-entrypoint.sh

EXPOSE 80
CMD ["/docker-entrypoint.sh"]
