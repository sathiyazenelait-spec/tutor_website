# ==============================================================
# Multi-stage Dockerfile for Spring Boot 3 Backend
# Optimized for Render Cloud Deployment (Repository Root)
# ==============================================================

# Stage 1: Build the backend JAR using Maven & JDK 21
FROM maven:3.9.6-eclipse-temurin-21 AS builder
WORKDIR /app

# Copy Maven Project Descriptor and Source Code from backend/
COPY backend/pom.xml .
COPY backend/src ./src

# Build production JAR (skip tests for quick deploy)
RUN mvn clean package -DskipTests

# Stage 2: Minimal, secure runtime container using JRE 21 Alpine
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Render passes dynamic port via $PORT (defaults to 8081 locally)
ENV PORT=8081
EXPOSE 8081

# Copy compiled JAR from builder stage
COPY --from=builder /app/target/*.jar app.jar

# Execute Spring Boot application
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-Dserver.port=${PORT}", "-jar", "app.jar"]
