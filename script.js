// IoT MQTT Panel Application
class IoTPanel {
    constructor() {
        this.mqttClient = null;
        this.panels = new Map();
        this.isConnected = false;
        this.charts = new Map();
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadPanelsFromStorage();
        this.updateConnectionStatus();
    }

    setupEventListeners() {
        // Modal controls
        document.getElementById('settingsBtn').addEventListener('click', () => this.showModal('settingsModal'));
        document.getElementById('addPanelBtn').addEventListener('click', () => this.showModal('addPanelModal'));
        document.getElementById('closeSettings').addEventListener('click', () => this.hideModal('settingsModal'));
        document.getElementById('closeAddPanel').addEventListener('click', () => this.hideModal('addPanelModal'));
        
        // Connection controls
        document.getElementById('connectBtn').addEventListener('click', () => this.connectMQTT());
        document.getElementById('disconnectBtn').addEventListener('click', () => this.disconnectMQTT());
        
        // Panel creation
        document.getElementById('createPanelBtn').addEventListener('click', () => this.createPanel());
        
        // Close modals on outside click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal(modal.id);
                }
            });
        });
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
    }

    async connectMQTT() {
        const host = document.getElementById('mqttHost').value;
        const username = document.getElementById('mqttUsername').value;
        const password = document.getElementById('mqttPassword').value;
        const clientId = document.getElementById('mqttClientId').value;

        if (!host) {
            alert('Please enter MQTT host');
            return;
        }

        try {
            const connectBtn = document.getElementById('connectBtn');
            connectBtn.innerHTML = '<div class="loading"></div> Connecting...';
            connectBtn.disabled = true;

            const options = {
                clientId: clientId || 'iot-panel-client-' + Math.random().toString(16).substr(2, 8),
                clean: true,
                reconnectPeriod: 1000,
                connectTimeout: 30 * 1000,
            };

            if (username) options.username = username;
            if (password) options.password = password;

            this.mqttClient = mqtt.connect(host, options);

            this.mqttClient.on('connect', () => {
                this.isConnected = true;
                this.updateConnectionStatus();
                this.subscribeToAllTopics();
                this.hideModal('settingsModal');
                connectBtn.innerHTML = '<i class="fas fa-plug"></i> Connect';
                connectBtn.disabled = false;
            });

            this.mqttClient.on('error', (error) => {
                console.error('MQTT Error:', error);
                alert('Connection failed: ' + error.message);
                this.isConnected = false;
                this.updateConnectionStatus();
                connectBtn.innerHTML = '<i class="fas fa-plug"></i> Connect';
                connectBtn.disabled = false;
            });

            this.mqttClient.on('disconnect', () => {
                this.isConnected = false;
                this.updateConnectionStatus();
            });

            this.mqttClient.on('message', (topic, message) => {
                this.handleMessage(topic, message.toString());
            });

        } catch (error) {
            console.error('Connection error:', error);
            alert('Connection failed: ' + error.message);
            document.getElementById('connectBtn').innerHTML = '<i class="fas fa-plug"></i> Connect';
            document.getElementById('connectBtn').disabled = false;
        }
    }

    disconnectMQTT() {
        if (this.mqttClient) {
            this.mqttClient.end();
            this.mqttClient = null;
        }
        this.isConnected = false;
        this.updateConnectionStatus();
    }

    subscribeToAllTopics() {
        this.panels.forEach(panel => {
            if (panel.topic && this.mqttClient) {
                this.mqttClient.subscribe(panel.topic);
                console.log('Subscribed to:', panel.topic);
            }
        });
    }

    handleMessage(topic, message) {
        const panel = Array.from(this.panels.values()).find(p => p.topic === topic);
        if (panel) {
            this.updatePanelData(panel.id, message);
        }
    }

    updateConnectionStatus() {
        const statusElement = document.getElementById('connectionStatus');
        if (this.isConnected) {
            statusElement.className = 'connection-status connected';
            statusElement.innerHTML = '<i class="fas fa-circle"></i><span>Connected</span>';
        } else {
            statusElement.className = 'connection-status disconnected';
            statusElement.innerHTML = '<i class="fas fa-circle"></i><span>Disconnected</span>';
        }
    }

    createPanel() {
        const title = document.getElementById('panelTitle').value;
        const topic = document.getElementById('panelTopic').value;
        const type = document.getElementById('panelType').value;
        const icon = document.getElementById('panelIcon').value;
        const color = document.getElementById('panelColor').value;
        const size = document.getElementById('panelSize').value;
        const min = parseFloat(document.getElementById('panelMin').value) || 0;
        const max = parseFloat(document.getElementById('panelMax').value) || 100;
        const unit = document.getElementById('panelUnit').value;

        if (!title || !topic) {
            alert('Please fill in title and topic');
            return;
        }

        const panelId = 'panel-' + Date.now();
        const panel = {
            id: panelId,
            title,
            topic,
            type,
            icon,
            color,
            size,
            min,
            max,
            unit,
            value: null,
            timestamp: null
        };

        this.panels.set(panelId, panel);
        this.renderPanel(panel);
        this.savePanelsToStorage();

        // Subscribe to topic if connected
        if (this.isConnected && this.mqttClient) {
            this.mqttClient.subscribe(topic);
        }

        this.hideModal('addPanelModal');
        this.clearPanelForm();
    }

    clearPanelForm() {
        document.getElementById('panelTitle').value = '';
        document.getElementById('panelTopic').value = '';
        document.getElementById('panelType').value = 'gauge';
        document.getElementById('panelIcon').value = 'fas fa-thermometer-half';
        document.getElementById('panelColor').value = 'blue';
        document.getElementById('panelSize').value = 'small';
        document.getElementById('panelMin').value = '';
        document.getElementById('panelMax').value = '';
        document.getElementById('panelUnit').value = '';
    }

    renderPanel(panel) {
        const panelsGrid = document.getElementById('panelsGrid');
        
        const panelElement = document.createElement('div');
        panelElement.className = `panel ${panel.color} ${panel.size}`;
        panelElement.id = panel.id;
        panelElement.draggable = true;

        panelElement.innerHTML = `
            <div class="panel-header">
                <div class="panel-title">
                    <i class="${panel.icon}"></i>
                    ${panel.title}
                </div>
                <div class="panel-controls">
                    <button onclick="iotPanel.editPanel('${panel.id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="iotPanel.deletePanel('${panel.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="panel-content">
                ${this.getPanelContent(panel)}
            </div>
        `;

        // Add drag and drop functionality
        this.setupDragAndDrop(panelElement);

        panelsGrid.appendChild(panelElement);

        // Initialize chart if needed
        if (panel.type === 'chart') {
            this.initializeChart(panel);
        }
    }

    getPanelContent(panel) {
        switch (panel.type) {
            case 'gauge':
                return `
                    <div class="gauge-container">
                        <svg class="gauge-svg" viewBox="0 0 120 120">
                            <circle class="gauge-bg" cx="60" cy="60" r="50"></circle>
                            <circle class="gauge-fill" cx="60" cy="60" r="50" 
                                    stroke-dasharray="0 314" stroke-dashoffset="0"></circle>
                        </svg>
                        <div class="gauge-value">--</div>
                        <div class="gauge-unit">${panel.unit}</div>
                    </div>
                `;
            
            case 'led':
                return `
                    <div class="led-container">
                        <div class="led-indicator"></div>
                        <div class="led-text">OFF</div>
                    </div>
                `;
            
            case 'chart':
                return `
                    <div class="chart-container">
                        <canvas id="chart-${panel.id}" width="400" height="200"></canvas>
                    </div>
                `;
            
            case 'number':
                return `
                    <div class="number-display">--</div>
                    <div class="number-unit">${panel.unit}</div>
                `;
            
            case 'text':
                return `
                    <div class="text-display">No data</div>
                `;
            
            case 'switch':
                return `
                    <div class="switch-container">
                        <div class="switch" onclick="iotPanel.toggleSwitch('${panel.id}')">
                            <div class="switch-thumb"></div>
                        </div>
                        <div class="led-text">OFF</div>
                    </div>
                `;
            
            case 'slider':
                return `
                    <div class="slider-container">
                        <input type="range" class="slider" min="${panel.min}" max="${panel.max}" 
                               value="${panel.min}" onchange="iotPanel.updateSlider('${panel.id}', this.value)">
                        <div class="slider-value">${panel.min}</div>
                        <div class="number-unit">${panel.unit}</div>
                    </div>
                `;
            
            default:
                return '<div class="text-display">Unknown panel type</div>';
        }
    }

    updatePanelData(panelId, value) {
        const panel = this.panels.get(panelId);
        if (!panel) return;

        panel.value = value;
        panel.timestamp = new Date();

        const panelElement = document.getElementById(panelId);
        if (!panelElement) return;

        switch (panel.type) {
            case 'gauge':
                this.updateGauge(panelElement, value, panel);
                break;
            case 'led':
                this.updateLED(panelElement, value, panel);
                break;
            case 'chart':
                this.updateChart(panelId, value, panel);
                break;
            case 'number':
                this.updateNumber(panelElement, value, panel);
                break;
            case 'text':
                this.updateText(panelElement, value, panel);
                break;
            case 'switch':
                this.updateSwitch(panelElement, value, panel);
                break;
            case 'slider':
                this.updateSliderDisplay(panelElement, value, panel);
                break;
        }
    }

    updateGauge(panelElement, value, panel) {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) return;

        const percentage = Math.min(Math.max((numValue - panel.min) / (panel.max - panel.min), 0), 1);
        const circumference = 2 * Math.PI * 50; // radius = 50
        const strokeDasharray = `${percentage * circumference} ${circumference}`;

        const gaugeFill = panelElement.querySelector('.gauge-fill');
        const gaugeValue = panelElement.querySelector('.gauge-value');
        
        gaugeFill.style.strokeDasharray = strokeDasharray;
        gaugeValue.textContent = numValue.toFixed(1);
    }

    updateLED(panelElement, value, panel) {
        const ledIndicator = panelElement.querySelector('.led-indicator');
        const ledText = panelElement.querySelector('.led-text');
        
        const isActive = value.toLowerCase() === 'true' || value === '1' || parseFloat(value) > 0;
        
        if (isActive) {
            ledIndicator.classList.add('active');
            ledText.textContent = 'ON';
        } else {
            ledIndicator.classList.remove('active');
            ledText.textContent = 'OFF';
        }
    }

    updateChart(panelId, value, panel) {
        const chart = this.charts.get(panelId);
        if (!chart) return;

        const numValue = parseFloat(value);
        if (isNaN(numValue)) return;

        const now = new Date();
        chart.data.labels.push(now.toLocaleTimeString());
        chart.data.datasets[0].data.push(numValue);

        // Keep only last 20 data points
        if (chart.data.labels.length > 20) {
            chart.data.labels.shift();
            chart.data.datasets[0].data.shift();
        }

        chart.update('none');
    }

    updateNumber(panelElement, value, panel) {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) return;

        const numberDisplay = panelElement.querySelector('.number-display');
        numberDisplay.textContent = numValue.toFixed(1);
    }

    updateText(panelElement, value, panel) {
        const textDisplay = panelElement.querySelector('.text-display');
        textDisplay.textContent = value;
    }

    updateSwitch(panelElement, value, panel) {
        const switchElement = panelElement.querySelector('.switch');
        const switchText = panelElement.querySelector('.led-text');
        
        const isActive = value.toLowerCase() === 'true' || value === '1';
        
        if (isActive) {
            switchElement.classList.add('active');
            switchText.textContent = 'ON';
        } else {
            switchElement.classList.remove('active');
            switchText.textContent = 'OFF';
        }
    }

    updateSliderDisplay(panelElement, value, panel) {
        const sliderValue = panelElement.querySelector('.slider-value');
        const numValue = parseFloat(value);
        if (isNaN(numValue)) return;
        
        sliderValue.textContent = numValue.toFixed(1);
    }

    initializeChart(panel) {
        const canvas = document.getElementById(`chart-${panel.id}`);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: panel.title,
                    data: [],
                    borderColor: this.getColorValue(panel.color),
                    backgroundColor: this.getColorValue(panel.color, 0.1),
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        min: panel.min,
                        max: panel.max
                    }
                },
                animation: {
                    duration: 0
                }
            }
        });

        this.charts.set(panel.id, chart);
    }

    getColorValue(color, alpha = 1) {
        const colors = {
            blue: `rgba(66, 153, 225, ${alpha})`,
            green: `rgba(72, 187, 120, ${alpha})`,
            red: `rgba(245, 101, 101, ${alpha})`,
            orange: `rgba(237, 137, 54, ${alpha})`,
            purple: `rgba(159, 122, 234, ${alpha})`,
            teal: `rgba(56, 178, 172, ${alpha})`,
            pink: `rgba(237, 100, 166, ${alpha})`
        };
        return colors[color] || colors.blue;
    }

    toggleSwitch(panelId) {
        const panel = this.panels.get(panelId);
        if (!panel || !this.isConnected) return;

        const panelElement = document.getElementById(panelId);
        const switchElement = panelElement.querySelector('.switch');
        const isActive = switchElement.classList.contains('active');
        const newValue = !isActive ? '1' : '0';

        // Publish to MQTT
        if (this.mqttClient) {
            this.mqttClient.publish(panel.topic, newValue);
        }

        // Update display
        this.updateSwitch(panelElement, newValue, panel);
    }

    updateSlider(panelId, value) {
        const panel = this.panels.get(panelId);
        if (!panel || !this.isConnected) return;

        // Publish to MQTT
        if (this.mqttClient) {
            this.mqttClient.publish(panel.topic, value);
        }

        // Update display
        const panelElement = document.getElementById(panelId);
        this.updateSliderDisplay(panelElement, value, panel);
    }

    setupDragAndDrop(panelElement) {
        panelElement.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', panelElement.id);
            panelElement.classList.add('dragging');
        });

        panelElement.addEventListener('dragend', (e) => {
            panelElement.classList.remove('dragging');
        });

        panelElement.addEventListener('dragover', (e) => {
            e.preventDefault();
            panelElement.classList.add('drag-over');
        });

        panelElement.addEventListener('dragleave', (e) => {
            panelElement.classList.remove('drag-over');
        });

        panelElement.addEventListener('drop', (e) => {
            e.preventDefault();
            panelElement.classList.remove('drag-over');
            
            const draggedId = e.dataTransfer.getData('text/plain');
            const draggedElement = document.getElementById(draggedId);
            
            if (draggedElement && draggedElement !== panelElement) {
                const panelsGrid = document.getElementById('panelsGrid');
                const rect = panelElement.getBoundingClientRect();
                const draggedRect = draggedElement.getBoundingClientRect();
                
                if (draggedRect.top < rect.top) {
                    panelsGrid.insertBefore(draggedElement, panelElement);
                } else {
                    panelsGrid.insertBefore(draggedElement, panelElement.nextSibling);
                }
            }
        });
    }

    editPanel(panelId) {
        const panel = this.panels.get(panelId);
        if (!panel) return;

        // Fill form with current values
        document.getElementById('panelTitle').value = panel.title;
        document.getElementById('panelTopic').value = panel.topic;
        document.getElementById('panelType').value = panel.type;
        document.getElementById('panelIcon').value = panel.icon;
        document.getElementById('panelColor').value = panel.color;
        document.getElementById('panelSize').value = panel.size;
        document.getElementById('panelMin').value = panel.min;
        document.getElementById('panelMax').value = panel.max;
        document.getElementById('panelUnit').value = panel.unit;

        // Store current panel ID for editing
        document.getElementById('createPanelBtn').dataset.editing = panelId;
        document.getElementById('createPanelBtn').textContent = 'Update Panel';

        this.showModal('addPanelModal');
    }

    deletePanel(panelId) {
        if (confirm('Are you sure you want to delete this panel?')) {
            // Unsubscribe from MQTT topic
            const panel = this.panels.get(panelId);
            if (panel && this.isConnected && this.mqttClient) {
                this.mqttClient.unsubscribe(panel.topic);
            }

            // Remove from DOM
            const panelElement = document.getElementById(panelId);
            if (panelElement) {
                panelElement.remove();
            }

            // Remove from charts
            if (this.charts.has(panelId)) {
                this.charts.get(panelId).destroy();
                this.charts.delete(panelId);
            }

            // Remove from panels map
            this.panels.delete(panelId);
            this.savePanelsToStorage();
        }
    }

    savePanelsToStorage() {
        const panelsArray = Array.from(this.panels.values());
        localStorage.setItem('iot-panels', JSON.stringify(panelsArray));
    }

    loadPanelsFromStorage() {
        const stored = localStorage.getItem('iot-panels');
        if (stored) {
            try {
                const panelsArray = JSON.parse(stored);
                panelsArray.forEach(panel => {
                    this.panels.set(panel.id, panel);
                    this.renderPanel(panel);
                });
            } catch (error) {
                console.error('Error loading panels from storage:', error);
            }
        }
    }
}

// Initialize the application
let iotPanel;
document.addEventListener('DOMContentLoaded', () => {
    iotPanel = new IoTPanel();
});

// Handle panel creation/editing
document.getElementById('createPanelBtn').addEventListener('click', () => {
    const editingId = document.getElementById('createPanelBtn').dataset.editing;
    
    if (editingId) {
        // Update existing panel
        const panel = iotPanel.panels.get(editingId);
        if (panel) {
            // Update panel properties
            panel.title = document.getElementById('panelTitle').value;
            panel.topic = document.getElementById('panelTopic').value;
            panel.type = document.getElementById('panelType').value;
            panel.icon = document.getElementById('panelIcon').value;
            panel.color = document.getElementById('panelColor').value;
            panel.size = document.getElementById('panelSize').value;
            panel.min = parseFloat(document.getElementById('panelMin').value) || 0;
            panel.max = parseFloat(document.getElementById('panelMax').value) || 100;
            panel.unit = document.getElementById('panelUnit').value;

            // Remove old panel from DOM
            const oldPanelElement = document.getElementById(editingId);
            if (oldPanelElement) {
                oldPanelElement.remove();
            }

            // Remove old chart
            if (iotPanel.charts.has(editingId)) {
                iotPanel.charts.get(editingId).destroy();
                iotPanel.charts.delete(editingId);
            }

            // Re-render panel
            iotPanel.renderPanel(panel);
            iotPanel.savePanelsToStorage();

            // Reset form
            document.getElementById('createPanelBtn').removeAttribute('data-editing');
            document.getElementById('createPanelBtn').textContent = 'Create Panel';
            iotPanel.clearPanelForm();
            iotPanel.hideModal('addPanelModal');
        }
    } else {
        // Create new panel
        iotPanel.createPanel();
    }
});