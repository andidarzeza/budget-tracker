# Build Spring Boot fat JAR (finalName: spring-inventar-backend)
FROM maven:3.9.9-eclipse-temurin-11 AS build
WORKDIR /app

COPY pom.xml .
COPY src ./src
RUN mvn -B -DskipTests package

FROM eclipse-temurin:11-jre-jammy
WORKDIR /app

RUN groupadd --system app && useradd --system --gid app app
COPY --from=build /app/target/spring-inventar-backend.jar /app/app.jar
RUN chown app:app /app/app.jar
USER app

EXPOSE 9000
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
