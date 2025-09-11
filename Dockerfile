FROM node:18-alpine

WORKDIR /usr/src/app

# First copy only package files for better caching
COPY package.json package-lock.json ./

# Install dependencies including devDependencies
RUN npm install --force --include=dev

# Copy the rest of the files
COPY . .

ENV NODE_ENV=development
ENV CHOKIDAR_USEPOLLING=true

EXPOSE 3000
CMD ["npm", "run", "dev"]