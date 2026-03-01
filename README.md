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

## 🚀 Enhancing for the Cloud & AI (Recommendations)

To elevate this project from a local Node.js script to a production-ready, AI-engineered application, consider the following architecture and feature upgrades:

### 1. Cloudflare Workers (Backend & APIs)
Currently, `server.js` combines static file serving, WebSocket broadcasting, and local file system scanning. To modernize this:
- **Move to Edge Functions:** Port the backend logic to **Cloudflare Workers**. 
- **Storage:** Since Cloudflare Workers cannot read local user hard drives, you would shift the app's purpose. Instead of scanning a local drive, users could upload files (or connect a cloud drive like Google Drive/Dropbox API). Store the file metadata in **Cloudflare D1** (SQL database) or **Cloudflare KV**.
- **Real-time via Durable Objects:** Use Cloudflare Durable Objects to manage the WebSocket connections, broadcasting state changes to all connected dashboard users globally with zero latency.

### 2. Vercel (Frontend Deployment)
- **Migrate to a Framework:** The current vanilla HTML/JS in `public/` is functional but hard to scale. Convert the frontend to **Next.js** or **React (Vite)**.
- **Deploy to Vercel:** Next.js integrates natively with Vercel. You connect your GitHub repo, and Vercel automatically deplolds the frontend, providing a global CDN, SSL certificates, and edge caching for lighting-fast dashboard loads.

### 3. AI Engineering Features (The "Smart" Dashboard)
To make this an "AI Engineered" project, you need to go beyond simply counting file sizes. You need intelligent analysis of the *contents* of the files.

**New Files & Integrations to Add:**
* `ai-analyzer.js` - A new service connected to an LLM (like OpenAI's GPT-4o, Anthropic's Claude, or Google's Gemini).
* `vector-db-sync.js` - A script to chunk file contents and store them in a Vector Database (like Pinecone or Cloudflare Vectorize) for Retrieval-Augmented Generation (RAG).

**AI Feature Ideas:**
1. **"Chat with your Files" (RAG):** Instead of just seeing that you have 50MB of `.txt` files, add a chat box. The user can ask, "Summarize the overarching themes of my documents," or "Which of my log files contain the most critical errors?" The AI reads the vector DB and answers based on the scanned files.
2. **Automated File Tagging:** When a new file is detected by Chokidar, send its contents (or a sample) to an LLM. Have the LLM automatically generate semantic tags (e.g., "Finance Form," "Meeting Notes," "Bug Report") and display these tags on the dashboard.
3. **Smart Cleanup Recommendations:** Have the AI analyze the file trends and types, then proactively suggest actions, such as: *"You have 5GB of `.tmp` and `.old` files that haven't been modified in 6 months. Would you like me to archive them to save space?"*
4. **Codebase Summarization:** If pointed at a directory of code, the AI can read the `.js`, `.py`, and `.md` files and generate a dynamic, real-time architecture diagram or a natural language summary of what the codebase does.
