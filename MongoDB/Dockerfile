# Use an official MongoDB image
FROM mongo:latest

# Expose the default MongoDB port
EXPOSE 27017


# Use ARG to declare build-time variables
ARG DB_USER
ARG DB_PASSWORD
ARG DB_DATABASE

# Set environment variables (optional)
ENV MONGO_INITDB_ROOT_USERNAME=$DB_USER
ENV MONGO_INITDB_ROOT_PASSWORD=$DB_PASSWORD
ENV MONGO_INITDB_DATABASE=$DB_DATABASE


# Copy the initialization script to the container
COPY init-script.js /docker-entrypoint-initdb.d/


# Expose custom port for MongoDB (optional)
ENV MONGO_PORT=27017

# Uncomment the line below if you want to enable MongoDB authentication
# ENV MONGO_AUTH=true

#--build-arg DB_HOST=
