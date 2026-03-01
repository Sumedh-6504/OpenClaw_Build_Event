document.addEventListener('DOMContentLoaded', () => {
    const socket = io();

    // Chart instances
    let pieChart, barChart, donutChart, lineChart;

    // DOM Elements
    const totalUsageEl = document.getElementById('total-usage');
    const totalTypesEl = document.getElementById('total-types');
    const topFilesListEl = document.getElementById('top-files-list');
    const themeSwitch = document.getElementById('theme-switch');

    const ctxPie = document.getElementById('pieChart').getContext('2d');
    const ctxBar = document.getElementById('barChart').getContext('2d');
    const ctxDonut = document.getElementById('donutChart').getContext('2d');
    const ctxLine = document.getElementById('lineChart').getContext('2d');

    // Color palette for charts
    const colors = [
        '#4FC3F7', '#81C784', '#FFD54F', '#FF8A65', '#9575CD',
        '#78909C', '#4DD0E1', '#AED581', '#FFB74D', '#B39DDB',
        '#29B6F6', '#66BB6A', '#FFEE58', '#FF7043', '#AB47BC'
    ];

    // Helper functions
    function formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    function getChartColors(count) {
        return colors.slice(0, count).map((color, index) => {
            // Simple color variation based on index or a fixed offset
            // For more sophisticated color generation, consider a library or algorithm
            return color;
        });
    }

    function hexToRgba(hex, alpha = 0.6) {
        const rgb = hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])([a-f\d]{0,2})$/i, (m, r, g, b, a) => {
            if (a) {
                return r+r + g+g + b+b + a+a;
            } else {
                return r+r + g+g + b+b;
            }
        });
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(rgb);
        const r = parseInt(result[1], 16);
        const g = parseInt(result[2], 16);
        const b = parseInt(result[3], 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    // Update charts with new data
    function updateCharts(data) {
        // Prepare data for charts
        const sortedFileTypes = Object.entries(data.filesByType)
            .sort(([, a], [, b]) => b.totalSize - a.totalSize);

        const labels = sortedFileTypes.map(([ext]) => ext || 'No Extension');
        const sizes = sortedFileTypes.map(([, { totalSize }]) => totalSize);
        const counts = sortedFileTypes.map(([, { count }]) => count);

        const top10FileTypes = sortedFileTypes.slice(0, 10);
        const top10Labels = top10FileTypes.map(([ext]) => ext || 'No Extension');
        const top10Sizes = top10FileTypes.map(([, { totalSize }]) => totalSize);

        const chartColorsPie = getChartColors(labels.length);
        const chartColorsBar = getChartColors(top10Labels.length);

        // Update summary elements
        totalUsageEl.textContent = formatBytes(data.totalDiskUsage);
        totalTypesEl.textContent = labels.length;

        // Update top files list
        topFilesListEl.innerHTML = '';
        top10FileTypes.forEach(([ext, { totalSize }]) => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${ext || 'No Extension'}</strong>: ${formatBytes(totalSize)}`;
            topFilesListEl.appendChild(li);
        });

        // --- Pie Chart ---
        if (pieChart) pieChart.destroy();
        pieChart = new Chart(ctxPie, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: sizes,
                    backgroundColor: chartColorsPie.map(c => hexToRgba(c, 0.8)),
                    hoverBackgroundColor: chartColorsPie.map(c => hexToRgba(c, 1))
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.label || 'No Extension';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed !== null) {
                                    label += formatBytes(context.parsed);
                                }
                                return label;
                            }
                        }
                    }
                }
            }
        });

        // --- Donut Chart ---
        if (donutChart) donutChart.destroy();
        donutChart = new Chart(ctxDonut, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: sizes,
                    backgroundColor: chartColorsPie.map(c => hexToRgba(c, 0.8)),
                    hoverBackgroundColor: chartColorsPie.map(c => hexToRgba(c, 1))
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%', // Makes it a donut chart
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.label || 'No Extension';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed !== null) {
                                    label += formatBytes(context.parsed);
                                }
                                return label;
                            }
                        }
                    }
                }
            }
        });

        // --- Bar Chart (Top 10) ---
        if (barChart) barChart.destroy();
        barChart = new Chart(ctxBar, {
            type: 'bar',
            data: {
                labels: top10Labels,
                datasets: [{
                    data: top10Sizes,
                    backgroundColor: chartColorsBar.map(c => hexToRgba(c, 0.8)),
                    borderColor: chartColorsBar.map(c => hexToRgba(c, 1)),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y', // Horizontal bar chart
                plugins: {
                    legend: {
                        display: false // No legend needed for single dataset bar chart
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    label += formatBytes(context.parsed.y);
                                }
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            callback: function(value) { return formatBytes(value); }
                        }
                    }
                }
            }
        });

        // --- Line Chart ---
        if (lineChart) lineChart.destroy();
        lineChart = new Chart(ctxLine, {
            type: 'line',
            data: {
                labels: data.fileTrend.map(item => item.timestamp),
                datasets: [{
                    label: 'Total Disk Usage',
                    data: data.fileTrend.map(item => item.totalSize),
                    borderColor: '#777DFF',
                    backgroundColor: hexToRgba('#777DFF', 0.5),
                    fill: true,
                    tension: 0.3 // Smoothes the line
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    label += formatBytes(context.parsed.y);
                                }
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'minute',
                            tooltipFormat: 'lll',
                            displayFormats: {
                                minute: 'h:mm A'
                            }
                        },
                        title: {
                            display: true,
                            text: 'Time'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Total Size'
                        },
                        ticks: {
                            callback: function(value) { return formatBytes(value); }
                        }
                    }
                }
            }
        });
    }

    // Event listener for socket connection
    socket.on('file_stats_update', (data) => {
        console.log('Received file stats update:', data);
        updateCharts(data);
    });

    // Event listener for errors
    socket.on('error_message', (error) => {
        console.error('Server error:', error.message);
        // Display error to user
        alert('An error occurred: ' + error.message);
    });

    // Theme toggle functionality
    themeSwitch.addEventListener('change', () => {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
        // Re-render charts if necessary or update chart themes if supported directly
        // For simplicity, we assume CSS handles most theming. Re-init might be needed for advanced cases.
        if (pieChart) pieChart.update();
        if (barChart) barChart.update();
        if (donutChart) donutChart.update();
        if (lineChart) lineChart.update();
    });

    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeSwitch.checked = true;
    }

    // Initial data fetch (redundant if server sends on connect, but good fallback)
    fetch('/api/file-stats')
        .then(response => response.json())
        .then(data => {
            console.log('Initial data fetched via API:', data);
            updateCharts(data);
        })
        .catch(error => {
            console.error('Error fetching initial data:', error);
            totalUsageEl.textContent = 'Error';
            totalTypesEl.textContent = 'Error';
        });
});
