# MailHog Project

This project contains a MailHog instance and a custom React-based frontend application.

## Project Structure

- `docs/`: The original MailHog documentation.
- Root files (`src/`, `public/`, `index.html`, etc.): A modern React + TypeScript + Vite frontend for MailHog.
- `docker-compose.yml`: Orchestrates the frontend and (optionally) backends.
- `Dockerfile`: Builds and serves the frontend application using Nginx.

## Features

- **Custom Frontend**: A clean, responsive React UI for viewing and managing emails.
- **Dockerized**: Easy to deploy and run using Docker Compose.
- **API Proxy**: Frontend is pre-configured to proxy API requests to the MailHog backend.

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)
- [Node.js](https://nodejs.org/) (for local development)

### Running the Application (Docker)

1. **Start the project**:
   ```bash
   docker compose up -d --build
   ```

2. **Access the application**:
   - **Custom Frontend**: [http://localhost:8026](http://localhost:8026)
   - **MailHog API/UI (Original)**: [http://localhost:8025](http://localhost:8025)
   - **SMTP Server**: `localhost:1025`

### Configuration

The frontend is served on port **8026** and is configured to restart automatically. It proxies requests to `host.docker.internal:8025` by default, which is where the original MailHog API usually resides.

## Development

### Frontend Setup

To run the frontend in development mode:

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

The dev server will be available at [http://localhost:5173](http://localhost:5173). It is configured in `vite.config.ts` to proxy `/api` requests to `http://localhost:8025`.

### Tech Stack

- **Framework**: React 19
- **Build Tool**: Vite 8
- **Language**: TypeScript
- **Styling**: Vanilla CSS (scoped)
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **HTTP Client**: Axios
