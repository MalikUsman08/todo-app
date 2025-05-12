FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Run migrations
RUN npm run migration:run

EXPOSE 3000

CMD ["node", "dist/src/main.js"] 