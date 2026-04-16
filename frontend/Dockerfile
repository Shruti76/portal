FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

ENV REACT_APP_API_URL=http://localhost:5001/api

CMD ["npm", "start"]
