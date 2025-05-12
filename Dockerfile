FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Make the startup script executable
RUN chmod +x start.sh

EXPOSE 3000

CMD ["./start.sh"] 