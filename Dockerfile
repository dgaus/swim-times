FROM node:24-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:24-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.js .
COPY --from=builder /app/package*.json .
COPY --from=builder /app/run.sh .

RUN npm ci --production
RUN chmod a+x run.sh

# Home Assistant Add-on specific
EXPOSE 3000

CMD [ "./run.sh" ]
