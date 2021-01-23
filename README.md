# Gamezop

- Use `docker-compose -f docker-compose.yml -f docker-compose.prod.yml up` to start the application.
- Use `docker-compose -f docker-compose.yml -f docker-compose.test.yml up` to start tests.

## Endpoints

- POST at "/" which accepts JSON in the format `{"FirstName": string, "LastName": string, "Age": number}`.
- GET at ":3000/" which accepts the query param `user` with value equal to the "FirstName" provided above. It returns `{"first_name": string, "last_name": string, "age": number}`.
