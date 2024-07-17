# Step 1: Install dependencies & Build the app

FROM node:18.13.0-bullseye@sha256:d871edd5b68105ebcbfcde3fe8c79d24cbdbb30430d9bd6251c57c56c7bd7646 AS build

# Set the working directory
WORKDIR /app

# Copy the package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the files
COPY . .

# Build the app
RUN npm run build


# Step 2: Serve the app with Nginx

FROM nginx:1.22.1-alpine@sha256:8745c93f1a1c33a8ec8c82707b9bb1c8fe9ebf2b5d82e9480e78625d809855a1

# Copy the built app from the previous stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80