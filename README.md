# MailHog Frontend

A modern React + TypeScript + Vite frontend for MailHog.

## Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Build for production**:
   ```bash
   npm run build
   ```

## Docker

The frontend is served using Nginx in a Docker container.

### Build and Run

```bash
docker compose up -d --build
```

### Configuration

- **Port**: 8026 (Host) -> 80 (Container)
- **Nginx Config**: `nginx.conf` handles SPA routing and API proxying.
- **API Proxy**: Proxies `/api` to `host.docker.internal:8025`.

## Tech Stack

- **Framework**: React 19
- **Build Tool**: Vite 8
- **Language**: TypeScript
- **Styling**: Vanilla CSS (scoped)
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **HTTP Client**: Axios
