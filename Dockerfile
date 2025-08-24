# -------- Stage 1: Build Angular project --------
FROM node:22.10-alpine AS build

WORKDIR /app

RUN npm cache clean --force

COPY . .

RUN npm install --legacy-peer-deps
RUN npm run build --prod


# -------- Stage 2: Serve with NGINX --------
FROM nginx:1.24-alpine AS ngi

# Copy built Angular app (update path if needed)
COPY --from=build /app/dist/browser /usr/share/nginx/html

# Secure permissions
RUN chmod -R 755 /usr/share/nginx/html

# Copy nginx configuration and SSL
COPY ./nginx-config/conf.d /etc/nginx/conf.d
COPY ./nginx-config/saga /etc/ssl/saga

