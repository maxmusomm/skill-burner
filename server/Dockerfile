FROM node:24.1
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 9000
CMD ["node", "server"]