FROM node:alpine

USER node

RUN mkdir /home/node/brokerpongbot
WORKDIR /home/node/brokerpongbot

COPY . /home/node/brokerpongbot
RUN sudo npm set unsafe-perm true
RUN sudo npm install

CMD [ "npm", "start" ]
