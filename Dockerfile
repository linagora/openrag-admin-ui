FROM node:23-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Optional subpath mounting (e.g. /indexerui). Pass via
# `docker build --build-arg BASE_PATH=/indexerui` or in docker-compose.yaml.
ARG BASE_PATH=""
ENV BASE_PATH=${BASE_PATH}
RUN npm run build

FROM node:23-alpine AS production

WORKDIR /app

COPY --from=build /app/package.json /app/package-lock.json ./
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh
COPY --from=build /app/build ./build
COPY --from=build /app/node_modules ./node_modules

EXPOSE 3000
ENV PORT=3000
ENV HOST=0.0.0.0

ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["node", "build"]