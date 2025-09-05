# ===== Stage 1: Build Stage =====
# Use the full Node.js image to ensure all system dependencies are present
FROM node:20 AS builder

# Do NOT set NODE_ENV here, so devDependencies will be installed

# Set the working directory
WORKDIR /app

# Add the node_modules binaries to the PATH
ENV PATH /app/node_modules/.bin:$PATH

# Copy package.json and the lock file
COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies for building)
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the Vite frontend and the TypeScript server
RUN npm run build


# ===== Stage 2: Production Stage =====
# Use a lightweight Node.js image for the final container
FROM node:20-slim

# Set NODE_ENV to production for the final image (this is correct)
ENV NODE_ENV=production

# Set the working directory
WORKDIR /app

# Copy package.json and the lock file again
COPY package.json package-lock.json ./

# Install ONLY production dependencies to keep the image small
RUN npm install --omit=dev

# Copy the built frontend and server from the builder stage
COPY --from=builder /app/dist ./dist

# Expose the port the application will run on
EXPOSE 8080

# The command to start the application
CMD [ "npm", "run", "start" ]