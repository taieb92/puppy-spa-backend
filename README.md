# Puppy Spa Waiting List System

A modern replacement for the physical logbook system at Puppy Spa, providing digital waiting list management with real-time updates and historical tracking.

## System Architecture

```mermaid
graph TD
    subgraph "Client Layer"
        B[Browser] --> N[Next.js Frontend]
    end

    subgraph "CDN & DNS"
        CF[Cloudflare]
    end

    subgraph "Frontend Hosting"
        V[Vercel]
    end

    subgraph "DigitalOcean Droplet"
        NG[Nginx Reverse Proxy]
        DC[Docker Container]
        NJ[NestJS API]
    end

    subgraph "Database"
        DB[(MySQL)]
    end

    B --> CF
    CF --> V
    CF --> NG
    NG --> DC
    DC --> NJ
    NJ --> DB
```

## Features

### Daily Operations
- **Waiting List Management**
  - Create daily waiting lists automatically
  - View and manage current day's queue
  - Real-time position updates
  - Mark entries as completed

### Calendar View
- Monthly overview of waiting lists
- Historical data access
- Date-based navigation

### Queue Management
- Automatic queue positioning
- Drag-and-drop reordering
- Status tracking (WAITING/COMPLETED)
- Search functionality

## Tech Stack

### Frontend
- **Framework**: Next.js
- **Language**: TypeScript
- **Hosting**: Vercel

### Backend
- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: MySQL
- **ORM**: Prisma
- **Container**: Docker
- **Reverse Proxy**: Nginx
- **Cloud**: DigitalOcean

### Infrastructure
- **DNS/CDN**: Cloudflare
- **CI/CD**: GitHub Actions
- **Container Registry**: DigitalOcean Container Registry

## Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- MySQL (v8 or higher)
- Docker
- DigitalOcean account
- Cloudflare account
- Vercel account

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/puppy-spa-backend.git
cd puppy-spa-backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```
Required environment variables:
```env
# Database
DATABASE_URL="mysql://user:password@host:port/database"

# Application
PORT=3000
NODE_ENV=development


4. Run database migrations:
```bash
npx prisma migrate deploy
```

5. Start the development server:
```bash
npm run start:dev
```

## API Documentation

The API documentation is available through Swagger UI:
```
https://puppy.ccdev.space/api
```

### Key Endpoints

#### Waiting Lists
- `POST /waiting-lists` - Create a new waiting list
- `GET /waiting-lists/date/:date` - Get waiting list by date
- `GET /waiting-lists/month/:month` - Get monthly waiting lists

#### Entries
- `POST /entries` - Create a new entry
- `GET /entries` - Get entries with optional filters
- `PATCH /entries/:id/status` - Update entry status
- `PATCH /entries/:id/position` - Update entry position

## Deployment

### Backend Deployment Flow

1. **Container Build**
   - Push code to GitHub
   - GitHub Actions builds Docker image
   - Image pushed to DigitalOcean Container Registry

2. **DigitalOcean Setup**
   - Pull latest image on droplet
   - Run container with Nginx reverse proxy
   - Configure SSL with Cloudflare

3. **Required GitHub Secrets**
```
DIGITALOCEAN_ACCESS_TOKEN
DOCKER_REGISTRY
DOCKER_IMAGE_NAME
SSH_PRIVATE_KEY
SSH_HOST
SSH_USERNAME
DATABASE_URL
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ZONE_ID
```



## Development


### Database Migrations

Create a new migration:
```bash
npx prisma migrate dev --name your_migration_name
```

Apply migrations:
```bash
npx prisma migrate deploy
```

