# ===== Stage 1: Build Stage =====
FROM node:20 AS builder

WORKDIR /app

# Add the node_modules binaries to the PATH
ENV PATH /app/node_modules/.bin:$PATH

# Copy package.json and the lock file
COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies for building)
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build ONLY the TypeScript server
RUN npm run build:server


# ===== Stage 2: Production Stage =====
# Use a lightweight Node.js image for the final container
FROM node:20-slim



WORKDIR /app

# Copy package.json and the lock file again
COPY package.json package-lock.json ./

# Install ONLY production dependencies to keep the image small
RUN npm install --omit=dev

# Copy ONLY the built server from the builder stage
COPY --from=builder /app/dist/server ./dist/server

# Expose the port the application will run on
EXPOSE 8080

# The command to start the application
CMD [ "node", "dist/server/node-build.mjs" ]