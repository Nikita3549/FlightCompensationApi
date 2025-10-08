FROM node:22-slim as build
WORKDIR opt/api
COPY package.json nest-cli.json ./
RUN npm install
COPY ./src ./prisma ./
RUN npx prisma generate
COPY tsconfig.json ./
RUN npm run build

FROM node:22-slim
WORKDIR opt/api
COPY package.json ./
COPY prisma ./
RUN npm install --only=prod
COPY --from=build /opt/api/dist ./dist