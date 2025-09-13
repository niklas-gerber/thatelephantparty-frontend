# That Elephant Party - Frontend

A modern Next.js frontend for event discovery and ticket purchasing, seamlessly integrated with the GCash payment workflow.

This frontend provides the public interface for viewing events, purchasing tickets, and uploading GCash payment slips. It is designed for a smooth, responsive user experience and is fully containerized for easy deployment. The admin section offers full control over events and attendees upon authentication.

## Features

- **Framework**: Next.js 14+ (App Router) with React 18
- **Styling**: Tailwind CSS for responsive and modern UI components
- **Type Safety**: Full TypeScript implementation
- **Payment Flow**: Integrated GCash payslip upload form
- **Admin Dashboard**: Full CRUD interface for event and ticket management
- **Containerization**: Ready for Docker deployment

## Setup

1.  **Clone the repository**
    ```bash
    git clone <frontend-repo-url>
    cd frontend
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure environment**
    Copy the `.env.local.example` file to `.env.local` and update the variables to point to your backend API:
    ```
    NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
    ```

4.  **Run the development server**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) in your browser.

5.  **For production with Docker**
    ```bash
    docker build -t thatelephantparty-frontend .
    docker run -p 3000:3000 thatelephantparty-frontend
    ```
    *Or use the provided `docker-compose.yml` in the root project for orchestrated deployment with the backend.*

## Application Details

The frontend is structured into two main experiences:

### Public Experience
- **Home & Static Pages**: Marketing and information content.
- **Event Discovery**: Browse all active events with details.
- **Ticket Purchase**: A streamlined form to select ticket quantities, provide attendee names, and complete the purchase by uploading a GCash payslip. Users receive immediate feedback and email confirmation.

### Admin Experience
- **Secure Login**: Access to the admin dashboard is protected by JWT authentication.
- **Event Management**: Create, read, update, and delete events. Upload event posters.
- **Attendee Oversight**: View all ticket purchases, verify payments, and manage check-in status for door service.
- **Reporting**: Access to generate and download PDF reports for accounting and attendee lists directly from the UI.

## Tech Stack

### Core
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components built with Tailwind

### Infrastructure
- **Containerization**: Docker
- **Deployment**: Optimized for Vercel, but deployable anywhere Node.js runs

### Key Dependencies
```json
{
  "next": "14.x",
  "react": "18.x",
  "react-dom": "18.x",
  "tailwindcss": "^3.4.0",
  "typescript": "5.x",
  "@types/node": "20.x",
  "@types/react": "18.x",
  "@types/react-dom": "18.x"
}
```


## License
Contact niklas.gerber@gmail.com for help with implementation 
and before commercial use. 
That Elephant Party is always happy to share resources with 
likeminded initiatives and collectives.

© 2024 That Elephant Party. This work is licensed under 
a Creative Commons Attribution-ShareAlike 4.0 International License.