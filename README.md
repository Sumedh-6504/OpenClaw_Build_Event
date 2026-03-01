📊 Live File Analytics Dashboard
<p align="center"> <b>Real-time local disk usage analytics with beautiful visualizations</b><br/> Built with Node.js, Express, Socket.io & Chart.js </p> <p align="center"> <img src="https://img.shields.io/badge/Node.js-18%2B-green?logo=node.js" /> <img src="https://img.shields.io/badge/Express.js-Backend-black?logo=express" /> <img src="https://img.shields.io/badge/Socket.io-Realtime-orange?logo=socket.io" /> <img src="https://img.shields.io/badge/Chart.js-Visualization-red?logo=chart.js" /> <img src="https://img.shields.io/badge/Security-Read--Only-blue" /> <img src="https://img.shields.io/badge/License-MIT-purple" /> </p>
🚀 Overview

Live File Analytics Dashboard is a secure, real-time local web application that visualizes file sizes grouped by file type.

It scans only /home/suemdh and provides interactive charts showing disk usage distribution.

Designed with:

🔐 Security-first architecture

⚡ Efficient async file scanning

📊 Modern UI & smooth animations

🔄 Real-time updates

✨ Features

🔍 Recursive file scanning (read-only)

📁 File grouping by extension

📊 Multiple chart types:

Pie Chart

Donut Chart

Bar Chart

Line Chart (trend over time)

🔄 Live updates via WebSockets

👀 File change detection using Chokidar

🌗 Dark / Light theme toggle

📈 Top 10 largest file types

🧮 Total disk usage summary

⚡ Update throttling (max every 2 seconds)

🔐 Strict directory isolation

🔒 Security Model
✔ Restricted Scope

Only scans:
      
      /home/<your-username>

❌ Never Accesses

/mnt/c

Windows-mounted drives

System root directories

External storage

✔ Protections Implemented

Read-only filesystem access

Directory traversal prevention

Path validation & normalization

Hidden/system folder exclusion (.git, node_modules)

No absolute paths exposed in frontend

No sudo required

🏗 Project Structure

    file-analyzer-dashboard/
    │
    ├── server.js
    ├── package.json
    ├── README.md
    │
    ├── /public
    │   ├── index.html
    │   ├── styles.css
    │   └── app.js
    │
    └── /utils
        └── fileScanner.js

🧠 Architecture
Backend

Node.js

Express

Async fs/promises

Socket.io

Chokidar

Frontend

Chart.js

Responsive layout

Smooth animated charts

Modern glassmorphism UI

📡 API
GET /api/file-stats

Returns:

    {
      "totalSize": 123456789,
      "types": {
        ".js": 3456789,
        ".png": 987654
      },
      "topTypes": [
        { "type": ".js", "size": 3456789 }
      ]
    }

No absolute file paths are returned.

⚙️ Installation
1️⃣ Clone Repository

    git clone https://github.com/your-username/file-analyzer-dashboard.git
    cd file-analyzer-dashboard

2️⃣ Install Dependencies

    npm install

3️⃣ Start Server

    node server.js

4️⃣ Open Browser

    http://localhost:3000

🔄 Real-Time Workflow

Initial recursive scan of /home/suemdh

File sizes grouped by extension

Chokidar monitors file changes

Updates throttled (2s max frequency)

WebSocket pushes updates

Charts update dynamically

📊 Charts Included
Chart	Purpose
Pie	Distribution by file type
Donut	Alternative distribution
Bar	Size comparison
Line	Growth trend over time
🎨 UI Highlights

Minimal modern layout

Subtle gradients & soft shadows

Smooth chart transitions

Interactive tooltips

Theme toggle (Dark / Light)

⚡ Performance Optimizations

Non-blocking async directory traversal

Excludes heavy folders

Throttled live updates

Efficient memory usage

Handles large directories gracefully

🛠 Development Notes

If modifying scan path in server.js:

Keep it within /home/<your-username>

Do not allow /mnt/c

Maintain path validation checks

Security checks must not be removed in production.

🚀 Future Improvements

Folder-level analytics

CSV export

Historical storage

Authentication layer

Docker deployment

Multi-directory support

📄 License

    MIT License

    👤 Sumedh-6504

Built for secure, real-time disk visualization.
