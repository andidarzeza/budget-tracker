FROM openjdk:11
EXPOSE 8080
#COPY . .
#FROM maven:3.6.0-jdk-11-slim AS build
#COPY src /home/app/src
#COPY pom.xml /home/app
#RUN mvn -f /home/app/pom.xml clean install -DskipTests
ADD target/spring-inventar-backend.jar spring-inventar-backend.jar
ENTRYPOINT ["java", "-jar", "spring-inventar-backend.jar"]