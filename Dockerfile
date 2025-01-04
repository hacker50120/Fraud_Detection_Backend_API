# Use an official Node.js image as a base image
FROM node:20

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Install additional tools
RUN apt-get update && apt-get install -y \
    curl \
    whois \
    wget \
    && wget https://gitlab.com/api/v4/projects/33695681/packages/generic/nrich/latest/nrich_latest_amd64.deb \
    && dpkg -i nrich_latest_amd64.deb \
    && rm nrich_latest_amd64.deb

# Copy the rest of the application code
COPY . .

# Expose the port your app runs on
EXPOSE 8080


# Install PM2 globally
RUN npm install -g pm2

# Start the Node.js application with PM2
CMD ["pm2-runtime", "start", "pm2.config.js"]



