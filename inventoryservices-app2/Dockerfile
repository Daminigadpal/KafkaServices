FROM node:18

# Set working directory
WORKDIR /inventoryservices-app2

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install nodemon globally
RUN npm install -g nodemon

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Start the application
CMD ["npm", "start"]


