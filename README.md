# That Elephant Party - Frontend

A Next.js-based frontend for event discovery and ticket purchasing, integrated with a GCash payment workflow.

This repository contains the public-facing interface for browsing events, purchasing tickets, and uploading GCash payment slips. It also includes an authenticated admin section for managing events and attendees. The application is containerized to support deployment in different environments.

## Features

### Public Experience
- Event Discovery: Browse upcoming and past events using a paginated interface.
- Ticket Purchasing Flow:
  - Multi-step purchase process including a required "House Rules" agreement.
  - Dynamic ticket bundle pricing and automatic adjustment of attendee input fields.
  - GCash payment slip upload with validation for file size and format.
- Static Content: Pages with information about the collective, press mentions, merchandise, and contact details.
- Responsive UI: Interface built with Tailwind CSS, using the Inter typeface, optimized for mobile and desktop devices.

### Admin Dashboard
- Secure Access: Cookie-based JWT authentication for admin routes.
- Event Management: Create, edit, and delete events; control visibility; define ticket limits; upload event posters.
- Ticket & Attendee Management:
  - View and verify ticket purchases and uploaded GCash payment slips.
  - Edit attendee data, add manual ticket entries, and monitor revenue.
- Door Management: Real-time attendee check-in and tracking of walk-in payments (Cash and GCash).
- Reporting & Exports: Generate and download PDF reports (attendee lists, financial reports, email lists).

### Security
- Authentication: Cookie-based JWT authentication for all admin endpoints, utilizing HTTP-only cookies to mitigate XSS risks.
- Route Protection: Automatic interception of 401 Unauthorized responses to secure admin routes and redirect unauthenticated users.
- Data Validation: Client-side form validation, including specific file type (JPEG, PNG, WebP) and size restrictions (max 1.5MB) for payment slip uploads.
- Configuration: Isolation of API endpoints and timezone configurations using environment variables.

## Tech Stack

- Framework: Next.js 15.3 (App Router)
- Library: React 19
- Styling: Tailwind CSS v4 with PostCSS
- Language: TypeScript 5
- Containerization: Docker (Node 20)

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
# Base URL of the backend API
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1

# Timezone configuration for event date handling
NEXT_PUBLIC_EVENT_TZ=Asia/Manila
NEXT_PUBLIC_EVENT_TZ_OFFSET=+08:00
```

## Setup & Local Development

### Clone the repository

```
git clone <repository-url>
cd thatelephantparty-frontend
```

### Install dependencies

```
npm install
```

### Run the development server

```
npm run dev
```

Open http://localhost:3000 in a browser.

### Docker Deployment

A Dockerfile is included for production deployment.

```
# Build the image
docker build -t thatelephantparty-frontend .

# Run the container
docker run -p 3000:3000 thatelephantparty-frontend
```

Ensure the backend is accessible and CORS is configured to allow requests from the frontend container.

## License
Contact niklas.gerber@gmail.com for help with implementation
and before commercial use.
That Elephant Party is always happy to share resources with
likeminded initiatives and collectives.

© 2024 That Elephant Party. This work is licensed under
a Creative Commons Attribution-ShareAlike 4.0 International License.