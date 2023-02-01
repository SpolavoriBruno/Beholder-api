FROM node:16 AS base

WORKDIR /usr/src/app
COPY package*.json ./
EXPOSE 8000

FROM base AS prod
ENV NODE_ENV=production
RUN npm ci --only=production
COPY . .
CMD ["node", "bin/server"]

FROM base AS dev
ENV NODE_ENV=development
RUN npm install -g nodemon && npm install
COPY . .
CMD ["nodemon", "bin/server"]

#docker build -t arcadia-beholder-api .
#docker run --rm -it -p 8080:80 arcadia-beholder-webserver
