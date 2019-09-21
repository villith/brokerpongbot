FROM node:alpine

WORKDIR /usr/src/app

COPY package*.json ./
COPY tsconfig.json ./

COPY ./src /src

RUN npm set unsafe-perm true
RUN npm install

COPY . /

CMD [ "npm", "start" ]
