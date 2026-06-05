// Dashboard JavaScript - Real-time metrics and interactivity

// Initialize charts on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeDCIChart();
    initializeConflictStatusChart();
    setupEventListeners();
    setupNotifications();
});

// ============================================
// Chart Initialization
// ============================================

function initializeDCIChart() {
    const ctx = document.getElementById('dciChart').getContext('2d');
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['2026-06-04', '2026-06-05', '2026-06-06'],
            datasets: [{
                label: 'Daily Conflict Index (DCI)',
                data: [0.6, 0.6, 0.4],
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 6,
                pointBackgroundColor: '#667eea',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointHoverRadius: 8,
                pointHoverBackgroundColor: '#764ba2'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 15,
                        font: { size: 12, weight: 'bold' }
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    cornerRadius: 5,
                    titleFont: { size: 13, weight: 'bold' },
                    bodyFont: { size: 12 }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 1,
                    ticks: {
                        callback: function(value) {
                            return value.toFixed(2);
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

function initializeConflictStatusChart() {
    const ctx = document.getElementById('conflictStatusChart').getContext('2d');
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['✅ Resolved', '⏳ Pending', '🔴 Escalated'],
            datasets: [{
                data: [5, 0, 0],
                backgroundColor: [
                    '#10b981',
                    '#f59e0b',
                    '#ef4444'
                ],
                borderColor: '#fff',
                borderWidth: 3,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 15,
                        font: { size: 12, weight: 'bold' }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    cornerRadius: 5,
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return context.label + ': ' + context.parsed + ' (' + percentage + '%)';
                        }
                    }
                }
            }
        }
    });
}

// ============================================
// Event Listeners
// ============================================

function setupEventListeners() {
    // Filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Smooth navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#' && document.querySelector(href)) {
                e.preventDefault();
                document.querySelector(href).scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ============================================
// Filter Conflicts Function
// ============================================

function filterConflicts(status) {
    const rows = document.querySelectorAll('.conflict-row');
    
    rows.forEach(row => {
        if (status === 'all') {
            row.style.display = 'table-row';
        } else {
            const rowStatus = row.classList.contains(status) ? 'table-row' : 'none';
            row.style.display = rowStatus;
        }
    });

    // Add fade animation
    rows.forEach(row => {
        if (row.style.display !== 'none') {
            row.style.opacity = '0';
            setTimeout(() => {
                row.style.transition = 'opacity 0.3s ease';
                row.style.opacity = '1';
            }, 10);
        }
    });
}

// ============================================
// Notifications System
// ============================================

function setupNotifications() {
    // Check for unread notifications
    const hasNotifications = localStorage.getItem('unreadNotifications');
    
    if (!hasNotifications) {
        showNotification(
            'Welcome to SOSHAI.Helix Dashboard',
            'All conflicts resolved. System is stable.',
            'success'
        );
        localStorage.setItem('unreadNotifications', 'true');
    }
}

function showNotification(title, message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <h4>${title}</h4>
            <p>${message}</p>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">✕</button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// ============================================
// Real-time Data Updates
// ============================================

function updateMetrics() {
    // Simulate real-time metric updates
    setInterval(() => {
        // Update DCI value
        const dciValue = document.querySelector('.metric-value .value');
        if (dciValue && dciValue.textContent === '0.4') {
            // Current DCI is stable, no change needed
        }
    }, 30000); // Update every 30 seconds
}

// ============================================
// Export Functionality
// ============================================

function exportMetricsAsCSV() {
    const metrics = {
        'DCI': '0.4',
        'Conflicts Resolved': '5/5',
        'Team Members': '6',
        'Version': 'v1.2.0',
        'Date': new Date().toISOString()
    };

    let csv = 'Metric,Value\n';
    for (const [key, value] of Object.entries(metrics)) {
        csv += `${key},${value}\n`;
    }

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `soshai-metrics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
}

// ============================================
// Performance Monitoring
// ============================================

function logPerformanceMetrics() {
    if (window.performance && window.performance.timing) {
        const timing = window.performance.timing;
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        console.log(`Dashboard loaded in ${loadTime}ms`);
    }
}

// ============================================
// Accessibility Features
// ============================================

function setupAccessibility() {
    // Add keyboard navigation support
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            const modals = document.querySelectorAll('.modal.open');
            modals.forEach(modal => modal.classList.remove('open'));
        }
    });

    // Add focus management
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Tab') {
            document.body.classList.add('keyboard-nav');
        }
    });

    document.addEventListener('mousedown', function() {
        document.body.classList.remove('keyboard-nav');
    });
}

// ============================================
// Storage & Persistence
// ============================================

function saveUserPreferences() {
    const preferences = {
        theme: 'light',
        language: 'ar',
        notifications: true,
        lastVisit: new Date().toISOString()
    };

    localStorage.setItem('soshai-preferences', JSON.stringify(preferences));
}

function loadUserPreferences() {
    const prefs = localStorage.getItem('soshai-preferences');
    return prefs ? JSON.parse(prefs) : null;
}

// ============================================
// API Integration (Future)
// ============================================

async function fetchMetricsFromAPI() {
    try {
        const response = await fetch('/api/metrics');
        const data = await response.json();
        updateDashboard(data);
    } catch (error) {
        console.error('Error fetching metrics:', error);
    }
}

function updateDashboard(data) {
    // Update dashboard with fresh data
    console.log('Dashboard updated with new metrics:', data);
}

// ============================================
// Initialize on Load
// ============================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        setupAccessibility();
        saveUserPreferences();
        logPerformanceMetrics();
    });
} else {
    setupAccessibility();
    saveUserPreferences();
    logPerformanceMetrics();
}

// Expose public API
window.SOSHAI = {
    filterConflicts: filterConflicts,
    showNotification: showNotification,
    exportMetricsAsCSV: exportMetricsAsCSV,
    updateMetrics: updateMetrics
};
