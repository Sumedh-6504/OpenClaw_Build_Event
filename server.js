// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs').promises;
const path = require('path');
const chokidar = require('chokidar');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const SCAN_DIRECTORY = process.env.SCAN_DIRECTORY || process.cwd(); // Scan current working directory by default
const IGNORED_DIRS = ['.git', 'node_modules', '.openclaw', 'file-analyzer-dashboard', 'public']; // Ignore hidden and specific dirs
const IGNORED_FILES = ['.DS_Store']; // Ignore specific files
const DEBOUNCE_MS = 2000; // Debounce updates to group changes

let fileStats = {
    totalDiskUsage: 0,
    filesByType: {},
    fileTrend: [], // For line chart, could store { timestamp, totalSize }
};

let updateTimeout = null;

// --- Security Helper ---
function isSafePath(filePath) {
    const absolutePath = path.resolve(filePath);
    const resolvedScanDirectory = path.resolve(SCAN_DIRECTORY);
    // Ensure the resolved path is indeed within the SCAN_DIRECTORY
    return absolutePath.startsWith(resolvedScanDirectory);
}

// --- File Scanning Logic ---
async function scanDirectory(dirPath) {
    let currentStats = {
        totalDiskUsage: 0,
        filesByType: {},
    };
    let items;
    try {
        items = await fs.readdir(dirPath, { withFileTypes: true });
    } catch (error) {
        if (error.code === 'EACCES') {
            console.warn(`Permission denied scanning directory: ${dirPath}`);
            return currentStats; // Return empty stats if permission denied
        }
        throw error; // Rethrow other errors
    }

    for (const item of items) {
        const itemName = item.name;
        const fullPath = path.join(dirPath, itemName);

        if (!isSafePath(fullPath)) {
            console.warn(`Skipping unsafe path: ${fullPath}`);
            continue;
        }

        const isIgnoredDir = item.isDirectory() && (itemName.startsWith('.') || IGNORED_DIRS.includes(itemName));
        const isIgnoredFile = item.isFile() && IGNORED_FILES.includes(itemName);

        if (isIgnoredDir || isIgnoredFile) {
            continue;
        }

        try {
            if (item.isDirectory()) {
                const subDirStats = await scanDirectory(fullPath);
                currentStats.totalDiskUsage += subDirStats.totalDiskUsage;
                // Merge filesByType from subdirectory
                for (const ext in subDirStats.filesByType) {
                    if (!currentStats.filesByType[ext]) {
                        currentStats.filesByType[ext] = { count: 0, totalSize: 0 };
                    }
                    currentStats.filesByType[ext].count += subDirStats.filesByType[ext].count;
                    currentStats.filesByType[ext].totalSize += subDirStats.filesByType[ext].totalSize;
                }
            } else if (item.isFile()) {
                const stats = await fs.stat(fullPath);
                currentStats.totalDiskUsage += stats.size;
                const ext = path.extname(itemName).toLowerCase();
                if (!currentStats.filesByType[ext]) {
                    currentStats.filesByType[ext] = { count: 0, totalSize: 0 };
                }
                currentStats.filesByType[ext].count++;
                currentStats.filesByType[ext].totalSize += stats.size;
            }
        } catch (error) {
            if (error.code !== 'ENOENT' && error.code !== 'EACCES') { // Log non-permission/not-found errors
                console.error(`Error processing ${fullPath}: ${error.message}`);
            }
        }
    }
    return currentStats;
}

// --- Update and Broadcast Function ---
async function performUpdateAndBroadcast() {
    try {
        console.log(`Scanning directory: ${SCAN_DIRECTORY}`);
        const stats = await scanDirectory(SCAN_DIRECTORY);

        // Update fileTrend for the line chart
        fileStats.fileTrend.push({ timestamp: new Date().toISOString(), totalSize: stats.totalDiskUsage });
        // Keep only the last N trend points if needed to manage memory/performance
        if (fileStats.fileTrend.length > 100) { // Example: keep last 100 points
            fileStats.fileTrend.shift();
        }

        fileStats = {
            ...stats,
            fileTrend: fileStats.fileTrend
        };

        console.log(`Broadcasting updated stats. Total size: ${fileStats.totalDiskUsage} bytes`);
        io.emit('file_stats_update', fileStats);

    } catch (error) {
        console.error('Error updating file stats:', error);
        io.emit('error_message', { message: 'Failed to update file stats.' });
    }
}

function updateAndBroadcast() {
    if (updateTimeout) {
        clearTimeout(updateTimeout);
    }
    updateTimeout = setTimeout(async () => {
        await performUpdateAndBroadcast();
        updateTimeout = null;
    }, DEBOUNCE_MS);
}

// --- Initial Scan and Watcher Setup ---
async function initialize() {
    // Perform initial scan on startup
    await performUpdateAndBroadcast(); 

    // Setup Chokidar watcher
    const watcher = chokidar.watch(SCAN_DIRECTORY, {
        ignored: [/(^|[\/\\])\../, 'node_modules', '.openclaw', 'file-analyzer-dashboard'], // Ignore dotfiles, node_modules, .openclaw, and the dashboard dir itself
        persistent: true,
        ignoreInitial: true, // Don't trigger for files already present during initial scan
        awaitWriteFinish: { // Wait for writes to finish before triggering events
            stabilityThreshold: 2000,
            pollInterval: 100
        },
        depth: null, // Watch recursively
        // Use only if you encounter issues with ignored paths on specific systems
        // usePolling: true, 
        // interval: 100,
        // binaryInterval: 300
    });

    watcher
        .on('add', async (filePath) => {
            if (isSafePath(filePath)) { // Double check path safety
                console.log(`File added: ${filePath}`);
                await updateAndBroadcast();
            }
        })
        .on('change', async (filePath) => {
            if (isSafePath(filePath)) { // Double check path safety
                console.log(`File changed: ${filePath}`);
                await updateAndBroadcast();
            }
        })
        .on('unlink', async (filePath) => {
            if (isSafePath(filePath)) { // Double check path safety
                console.log(`File removed: ${filePath}`);
                await updateAndBroadcast();
            }
        })
        .on('addDir', async (dirPath) => {
            if (isSafePath(dirPath)) { // Double check path safety
                console.log(`Directory added: ${dirPath}`);
                await updateAndBroadcast();
            }
        })
        .on('unlinkDir', async (dirPath) => {
            if (isSafePath(dirPath)) { // Double check path safety
                console.log(`Directory removed: ${dirPath}`);
                await updateAndBroadcast();
            }
        })
        .on('error', (error) => console.error(`Watcher error: ${error}`));

    console.log(`Watcher started for ${SCAN_DIRECTORY}`);
}

// --- Server Setup ---
// Serve frontend files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint for current file stats
app.get('/api/file-stats', (req, res) => {
    res.json(fileStats);
});

// Fallback route to serve index.html for any other GET requests,
// allowing frontend routing if we were to use a framework like React/Vue later.
app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

io.on('connection', (socket) => {
    console.log('A user connected');
    // Send current stats immediately to a new client
    socket.emit('file_stats_update', fileStats);

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
    // Start the initialization process (scan and watch)
    initialize().catch(err => {
        console.error('Failed to initialize application:', err);
    });
});
