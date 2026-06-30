FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build -- --configuration production

FROM nginx:alpine
COPY --from=build /app/dist/frontend-web/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["/bin/sh", "-c", "if [ -n \"$BACKEND_URL\" ]; then sed -i \"s|http://localhost:8080|$BACKEND_URL|g\" /usr/share/nginx/html/*.js; fi && nginx -g 'daemon off;'"]
