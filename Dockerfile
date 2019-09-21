FROM node:alpine

WORKDIR /server

COPY . /server
RUN npm set unsafe-perm true
RUN npm install

CMD [ "npm", "start" ]
