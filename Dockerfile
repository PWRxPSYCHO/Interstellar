FROM node:latest

# Create directory
RUN mkdir =p /usr/src/interstellar
WORKDIR /usr/src/interstellar

# Copy and install bot
COPY package.json /usr/src/interstellar
RUN npm install

# Copy Bot
COPY . /usr/src/interstellar

# Start
CMD ["node", "dist/index.js"]