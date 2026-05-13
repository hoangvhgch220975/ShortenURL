FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies without msnodesqlv8
RUN npm install --no-package-lock

# Copy application files
COPY . .

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "server.js"]