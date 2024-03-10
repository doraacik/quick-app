FROM node:21

WORKDIR /quick-app

COPY package*.json ./

RUN npm install

COPY . /quick-app

CMD [ "npm", "start"]

