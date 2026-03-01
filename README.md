# File Analyzer Dashboard 🦾

A robust, real-time file system analysis dashboard. It scans a designated directory, recursively calculates disk usage and file type distributions, and broadcasts these statistics to a live web dashboard using WebSockets.

## Features

- **Real-time Monitoring:** Uses `chokidar` to watch for file additions, changes, and deletions, broadcasting updates immediately.
- **Debounced Updates:** Employs a debounce mechanism to efficiently handle rapid, successive file changes without overwhelming the client.
- **Interactive Visualizations:** Powered by Chart.js to display:
  - Pie/Donut charts for file type distribution.
  - Bar charts for the top 10 largest file extensions.
  - Line charts tracking total disk usage trends over time.
- **Top Files List:** Dynamically lists the top 10 largest file types.
- **Dark Mode:** Includes a theme toggle for light/dark viewing preferences.
- **Secure File Serving:** Backend safely serves frontend static assets from a dedicated `public/` directory to prevent source code exposure.

## Prerequisites

- [Node.js](https://nodejs.org/) (v16.x or higher recommended)
- npm (comes with Node.js)

## Installation & Setup

1. **Clone the repository** (or download the source):
   ```bash
   git clone <your-repo-url>
   cd OpenClaw_Build_Event
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```
   *This installs Express, Socket.io, Chokidar, and other backend requirements.*

3. **Start the Server**:
   ```bash
   node server.js
   ```

4. **View the Dashboard**:
   Open your browser and navigate to `http://localhost:3000`. By default, the server scans the current working directory where `server.js` was launched.

### Configuration
You can customize the directory being scanned by setting the `SCAN_DIRECTORY` environment variable before starting the server.
```bash
# Windows (PowerShell)
$env:SCAN_DIRECTORY="C:\Path\To\Scan"; node server.js

# Linux/macOS
SCAN_DIRECTORY="/path/to/scan" node server.js
```

---


