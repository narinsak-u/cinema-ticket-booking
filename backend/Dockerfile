FROM node:22-alpine
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL:-mongodb://localhost:27017/build}
WORKDIR /app
COPY package*.json prisma.config.ts ./
RUN npm install
COPY prisma/ ./prisma/
RUN npx prisma generate
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]
