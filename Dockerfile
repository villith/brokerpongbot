FROM node:alpine

WORKDIR /usr/src/app

COPY package*.json ./
COPY tsconfig.json ./

COPY src ./src

RUN npm set unsafe-perm true
RUN npm install

COPY . /

ENV SLACK_TOKEN=xoxb-749408629571-760936650277-zIGwEIkmjkH0M8B7BihHgbwg,SLACK_SIGNING_SECRET=cf39863e9fab8053f9e586753fa06949,COMMAND_INITIATOR=!
CMD [ "npm", "start" ]
