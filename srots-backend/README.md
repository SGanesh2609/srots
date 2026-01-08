# srots-backend-java

This is a lightweight Spring Boot scaffold for SROTS backend (Java 17, Spring Boot 3).

## Quick start

1. Build: `mvn -U -DskipTests package`
2. Run: `mvn spring-boot:run` or run the generated jar: `java -jar target/srots-backend-java-0.0.1-SNAPSHOT.jar`

## Configuration

Set environment variables or edit `src/main/resources/application.properties`:

- `DB_URL` (default `jdbc:mysql://localhost:3306/srots`)
- `DB_USER` (default `root`)
- `DB_PASS` (default `password`)
- `SERVER_PORT` (default `8080`)
- `LOG_LEVEL` (default `INFO`)

## API docs

- Swagger UI: `http://localhost:8080/swagger-ui.html` (after running)
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`

## Email notifications

Configure SMTP settings in `src/main/resources/application.properties` (or via env vars):

- `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASS`, `MAIL_FROM`

The app sends emails for:
- **Login** (POST `/api/v1/auth/login`) — sends a login notification email to the user's registered email.
- **Job created/updated** (POST/PUT `/api/v1/jobs`) — notifies users belonging to the job's `collegeId`.

## Notes

- The project includes entities, repositories and basic controllers, with Flyway migrations and seed data derived from the Node mock store.
- If you want HTML email templates, I can add Thymeleaf templates and richer email formatting.
