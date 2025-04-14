# Use an official Node.js LTS runtime as a parent image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
# Use package-lock.json to ensure reproducible installs
COPY package*.json ./

# Install app dependencies
RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

# Make port 3000 available to the world outside this container
# (assuming your server listens on port 3000 as per dashboard/.env.local)
EXPOSE 3000

# Define the command to run your app
CMD [ "node", "server.js" ] 