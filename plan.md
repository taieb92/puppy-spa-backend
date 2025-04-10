# Puppy Spa Backend Development Plan (NestJS)

## Week 1: Project Setup & Core Structure

### Day 1: Initial Setup
- [ ] Install Node.js and NestJS CLI
- [ ] Create new NestJS project: `nest new puppy-spa-backend`
- [ ] Set up MySQL database named "puppy_spa"
- [ ] Set up Prisma ORM:
  - [ ] Install Prisma: `npm install prisma --save-dev`
  - [ ] Initialize Prisma: `npx prisma init`
  - [ ] Configure MySQL connection in `.env` file
- [ ] Set up database connection

### Day 2: Create Prisma Schema & DTOs
- [ ] Define Prisma schema in `prisma/schema.prisma`:
  ```prisma
  model WaitingList {
    id        Int      @id @default(autoincrement())
    date      DateTime @unique
    createdAt DateTime @default(now()) @map("created_at")
    entries   WaitingListEntry[]

    @@map("waiting_lists")
  }

  model WaitingListEntry {
    id             Int        @id @default(autoincrement())
    waitingListId  Int        @map("waiting_list_id")
    ownerName      String     @map("owner_name")
    puppyName      String     @map("puppy_name")
    serviceRequired String     @map("service_required")
    arrivalTime    DateTime   @map("arrival_time")
    position       Int
    status         String     @default("waiting")
    createdAt      DateTime   @default(now()) @map("created_at")
    updatedAt      DateTime   @updatedAt @map("updated_at")
    waitingList    WaitingList @relation(fields: [waitingListId], references: [id])

    @@map("waiting_list_entries")
  }
  ```
- [ ] Generate Prisma client: `npx prisma generate`
- [ ] Create DTOs:
  - `create-waiting-list.dto.ts` (date)
  - `create-waiting-list-entry.dto.ts` (owner_name, puppy_name, service_required)
  - `update-entry-status.dto.ts` (status)
  - `update-entry-position.dto.ts` (position)

### Day 3: Core Modules Setup
- [ ] Create PrismaService for database access
- [ ] Generate waiting list module: `nest g module waiting-lists`
- [ ] Generate waiting list entries module: `nest g module waiting-list-entries`
- [ ] Generate search module: `nest g module search`
- [ ] Set up dependencies and imports in each module

## Week 2: API Implementation

### Day 4: Waiting List Service & Controller
- [ ] Implement `WaitingListService` using Prisma client with methods:
  - `createWaitingList(date)`: Create new list for a day
  - `getWaitingList(id)`: Get list by ID
  - `getWaitingListByDate(date)`: Get list by date
  - `getAllWaitingLists(page, limit)`: Get all lists with pagination
- [ ] Implement `WaitingListController` with endpoints:
  - POST `/waiting-lists`
  - GET `/waiting-lists`
  - GET `/waiting-lists/by-date/:date`
- [ ] Use Prisma's unique constraint for date to prevent duplicate lists

### Day 5: Waiting List Entry Service & Controller
- [ ] Implement `WaitingListEntryService` using Prisma client with methods:
  - `createEntry(listId, entryData)`: Add new entry to list
  - `getEntriesByListId(listId, status)`: Get entries for a list
  - `updateEntryStatus(entryId, status)`: Mark entry as serviced
  - `updateEntryPosition(entryId, position)`: Change position
- [ ] Implement auto-positioning logic for new entries with Prisma transactions
- [ ] Implement `WaitingListEntryController` with endpoints:
  - POST `/waiting-lists/:waiting_list_id/entries`
  - GET `/waiting-lists/:waiting_list_id/entries`
  - PATCH `/waiting-lists/:waiting_list_id/entries/:entry_id/status`
  - PATCH `/waiting-lists/:waiting_list_id/entries/:entry_id/position`

### Day 6: Search Implementation
- [ ] Implement `SearchService` using Prisma client with methods:
  - `searchEntries(query)`: Search across all entries
- [ ] Use Prisma's built-in search capabilities for partial matching of owner and puppy names
- [ ] Implement `SearchController` with endpoint:
  - GET `/search?query=:query`

## Week 3: Testing & Refinement

### Day 7: Error Handling & Validation
- [ ] Implement global exception filter
- [ ] Add input validation using class-validator
- [ ] Add error handling for all endpoints
- [ ] Implement proper HTTP status codes

### Day 8: Unit Testing
- [ ] Write tests for `WaitingListService` with Prisma mocking
- [ ] Write tests for `WaitingListEntryService` with Prisma mocking
- [ ] Write tests for `SearchService` with Prisma mocking
- [ ] Write tests for controllers

### Day 9: Integration Testing
- [ ] Create end-to-end tests for API endpoints using test database
- [ ] Test position reordering logic
- [ ] Test unique date constraint
- [ ] Test search functionality

## Week 4: Documentation & Deployment

### Day 10: API Documentation
- [ ] Implement Swagger documentation
- [ ] Add descriptions to all endpoints
- [ ] Generate API reference

### Day 11: Performance Optimization
- [ ] Use Prisma's query optimization features
- [ ] Create Prisma indexes for frequently queried fields
- [ ] Implement caching for common requests

### Day 12: Deployment Preparation
- [ ] Prepare production configuration
- [ ] Generate Prisma migrations: `npx prisma migrate dev`
- [ ] Add deployment documentation
- [ ] Deploy to staging environment

## Technical Notes

### Prisma Schema
```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model WaitingList {
  id        Int      @id @default(autoincrement())
  date      DateTime @unique
  createdAt DateTime @default(now()) @map("created_at")
  entries   WaitingListEntry[]

  @@map("waiting_lists")
}

model WaitingListEntry {
  id             Int        @id @default(autoincrement())
  waitingListId  Int        @map("waiting_list_id")
  ownerName      String     @map("owner_name")
  puppyName      String     @map("puppy_name")
  serviceRequired String     @map("service_required")
  arrivalTime    DateTime   @map("arrival_time")
  position       Int
  status         String     @default("waiting")
  createdAt      DateTime   @default(now()) @map("created_at")
  updatedAt      DateTime   @updatedAt @map("updated_at")
  waitingList    WaitingList @relation(fields: [waitingListId], references: [id])

  @@map("waiting_list_entries")
}
```

### API Endpoints Overview
```
POST   /api/v1/waiting-lists                                    - Create new waiting list
GET    /api/v1/waiting-lists                                    - Get all waiting lists
GET    /api/v1/waiting-lists/by-date/:date                      - Get waiting list by date
POST   /api/v1/waiting-lists/:waiting_list_id/entries           - Add entry to waiting list
GET    /api/v1/waiting-lists/:waiting_list_id/entries           - Get entries for a list
PATCH  /api/v1/waiting-lists/:waiting_list_id/entries/:entry_id/status   - Update status
PATCH  /api/v1/waiting-lists/:waiting_list_id/entries/:entry_id/position - Update position
GET    /api/v1/search?query=:query                              - Search entries
```

## Key Business Rules
1. Each day can only have one waiting list
2. When a new entry is added, its position is automatically assigned
3. Entries can be reordered regardless of status
4. Search allows partial matching of owner and puppy names