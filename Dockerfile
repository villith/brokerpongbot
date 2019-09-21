FROM node:alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm set unsafe-perm true
RUN npm install

COPY . /

CMD [ "npm", "start" ]
