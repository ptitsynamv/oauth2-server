FROM node:current-slim
WORKDIR /home/maria/Projects/oauth2-server

COPY . .
RUN yarn install

EXPOSE 3001

CMD [ "node", "./index.js" ]
