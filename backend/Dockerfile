FROM node:18

RUN apt-get update && apt-get install -y redis-server

WORKDIR /app

COPY package.json yarn.lock* ./

RUN yarn install

COPY . .

RUN yarn build

EXPOSE 5000 6379

COPY start.sh .
RUN chmod +x start.sh

CMD ["./start.sh"]
