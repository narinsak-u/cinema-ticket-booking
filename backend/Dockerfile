FROM node:22-alpine
WORKDIR /app
COPY package*.json prisma.config.ts ./
RUN npm install
COPY prisma/ ./prisma/
RUN npx prisma generate
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]
