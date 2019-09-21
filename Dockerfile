FROM node:alpine

USER node

RUN mkdir /home/node/brokerpongbot
WORKDIR /home/node/brokerpongbot

COPY . /home/node/brokerpongbot
RUN npm set unsafe-perm true
RUN npm install

CMD [ "npm", "start" ]
