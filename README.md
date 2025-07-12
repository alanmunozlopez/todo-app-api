# Todo API

Simple REST API for task management built with NestJS and PostgreSQL.

## Environment Variables

Create a `.env` file:

```bash
DATABASE_URL="neonurl"
FRONTEND_URL="http://localhost:5173"
```

## Setup

```bash
npm install
npx prisma generate
npx prisma db push
```

## Development

```bash
npm run start:dev
```

## Build

```bash
npm run build
npm run start:prod
```

## Tests

```bash
npm run test
npm run test:e2e
```

## API Endpoints

- `GET /task` - Get all tasks
- `POST /task` - Create task
- `PUT /task/:id` - Update task
- `DELETE /task/:id` - Delete task
