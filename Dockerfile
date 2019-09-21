FROM node:alpine

WORKDIR /usr/src/app

COPY package*.json ./
COPY tsconfig.json ./

RUN npm set unsafe-perm true
RUN npm install

COPY . /

RUN tsc

CMD [ "npm", "start" ]
