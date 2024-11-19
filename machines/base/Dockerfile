
FROM node:18.5.0-alpine

RUN mkdir -p /app/machine
WORKDIR /app/machine
COPY . ./
RUN npm install
EXPOSE 3001
CMD ["npm", "start"]
