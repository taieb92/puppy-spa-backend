# Puppy Spa Backend

A NestJS backend application for managing a puppy spa service, handling waiting lists and appointments.

## Features

- Waiting list management
- Appointment scheduling
- RESTful API endpoints
- MySQL database integration with Prisma
- Docker containerization
- CI/CD with GitHub Actions

## Prerequisites

- Node.js 20.x
- npm
- Docker
- MySQL database

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
DATABASE_URL="mysql://user:password@host:port/database"
PORT=3000
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/puppy-spa-backend.git
cd puppy-spa-backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
```bash
npx prisma migrate dev
```

## Development

Run the application in development mode:
```bash
npm run start:dev
```

The application will be available at `http://localhost:3000`

## Testing

Run the test suite:
```bash
npm test
```

## API Documentation

### Health Check
- `GET /api/health` - Check application health status

### Waiting Lists
- `GET /waiting-lists/date/{date}` - Get waiting list for a specific date
- `GET /waiting-lists/month/{month}` - Get waiting lists for a specific month
- `POST /waiting-lists` - Create a new waiting list
- `GET /waiting-lists/{id}` - Get a specific waiting list
- `GET /waiting-lists/{id}/entries` - Get entries for a waiting list

### Waiting List Entries
- `POST /waiting-list-entries` - Create a new entry
- `GET /waiting-list-entries/{id}` - Get a specific entry
- `GET /waiting-list-entries/list?listId={id}` - Get entries for a list with optional search

## Docker

Build the Docker image:
```bash
docker build -t puppy-spa-backend .
```

Run the container:
```bash
docker run -d \
  -p 3000:3000 \
  -e DATABASE_URL="your_database_url" \
  --name puppy-spa-backend \
  puppy-spa-backend
```

## CI/CD

The project uses GitHub Actions for continuous integration and deployment:

- Builds and tests on every push to the `main` branch
- Builds and pushes Docker images to DigitalOcean Container Registry
- Deploys to DigitalOcean Droplet

Required GitHub Secrets:
- `DIGITALOCEAN_ACCESS_TOKEN`
- `REGISTRY`
- `DROPLET_HOST`
- `DROPLET_USERNAME`
- `DROPLET_SSH_KEY`
- `DATABASE_URL`

## Project Structure

```
src/
├── waiting-lists/           # Waiting list module
│   ├── dto/                # Data Transfer Objects
│   ├── entities/           # Database entities
│   ├── waiting-lists.controller.ts
│   └── waiting-lists.service.ts
├── waiting-list-entries/   # Waiting list entries module
│   ├── dto/
│   ├── entities/
│   ├── waiting-list-entries.controller.ts
│   └── waiting-list-entries.service.ts
├── prisma/                 # Prisma configuration
├── app.module.ts           # Root module
└── main.ts                 # Application entry point
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
