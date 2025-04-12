FROM node:lts-slim AS dist

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install app dependencies
RUN npm ci

# Build app
COPY . ./
RUN npm run format
RUN npm run build

FROM node:lts-slim AS node_modules

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install app dependencies
RUN npm ci --only=production

# The second FROM is the second stage in the multi-stage build and is used to the application.
FROM node:lts-slim
ARG PORT=3000

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Copy from dist image only files and folders required to run the Nest app.
COPY --from=dist /dist /usr/src/app/dist
COPY --from=node_modules /node_modules /usr/src/app/node_modules
COPY package*.json ./

# Nest apps usually bind to port 3000, EXPOSE the same port for the Docker image
EXPOSE $PORT
CMD [ "npm", "run", "start:prod" ] 