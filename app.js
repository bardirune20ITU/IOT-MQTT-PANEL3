// IoT MQTT Panel Application
class MQTTPanel {
    constructor() {
        this.client = null;
        this.widgets = [];
        this.currentWidgetId = null;
        this.currentWidgetType = null;
        this.connectionSettings = this.loadSettings();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadWidgets();
        this.renderDashboard();
        
        // Generate random client ID if not set
        if (!this.connectionSettings.clientId) {
            this.connectionSettings.clientId = 'mqtt-panel-' + Math.random().toString(16).substr(2, 8);
            document.getElementById('clientId').value = this.connectionSettings.clientId;
        }
    }

    setupEventListeners() {
        // Settings button
        document.getElementById('settingsBtn').addEventListener('click', () => {
            this.openModal('settingsModal');
            this.populateSettingsForm();
        });

        // Add widget button
        document.getElementById('addWidgetBtn').addEventListener('click', () => {
            this.openModal('addWidgetModal');
        });

        // Connect button
        document.getElementById('connectBtn').addEventListener('click', () => {
            this.saveSettings();
            this.connect();
            this.closeModal('settingsModal');
        });

        // Save widget button
        document.getElementById('saveWidgetBtn').addEventListener('click', () => {
            this.saveWidget();
        });

        // Delete widget button
        document.getElementById('deleteWidgetBtn').addEventListener('click', () => {
            if (confirm('Are you sure you want to delete this widget?')) {
                this.deleteWidget(this.currentWidgetId);
                this.closeModal('configWidgetModal');
            }
        });

        // Widget type selection
        document.querySelectorAll('.widget-type-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const type = card.dataset.type;
                this.currentWidgetType = type;
                this.currentWidgetId = null;
                this.closeModal('addWidgetModal');
                this.openConfigModal(type);
            });
        });

        // Close modal buttons
        document.querySelectorAll('.close-btn, [data-modal]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (e.target.classList.contains('close-btn') || e.target.closest('.close-btn')) {
                    const modal = e.target.closest('.modal');
                    if (modal) this.closeModal(modal.id);
                } else if (btn.dataset.modal) {
                    this.closeModal(btn.dataset.modal);
                }
            });
        });

        // Close modal on backdrop click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal.id);
                }
            });
        });
    }

    // Connection Management
    connect() {
        const { brokerUrl, clientId, username, password, cleanSession } = this.connectionSettings;

        if (!brokerUrl) {
            alert('Please enter a broker URL');
            return;
        }

        const options = {
            clientId,
            clean: cleanSession,
            reconnectPeriod: 5000,
        };

        if (username) options.username = username;
        if (password) options.password = password;

        try {
            this.client = mqtt.connect(brokerUrl, options);

            this.client.on('connect', () => {
                console.log('Connected to MQTT broker');
                this.updateConnectionStatus(true);
                this.subscribeToTopics();
            });

            this.client.on('message', (topic, message) => {
                this.handleMessage(topic, message.toString());
            });

            this.client.on('error', (error) => {
                console.error('MQTT Error:', error);
                this.updateConnectionStatus(false);
            });

            this.client.on('close', () => {
                console.log('Disconnected from MQTT broker');
                this.updateConnectionStatus(false);
            });
        } catch (error) {
            console.error('Connection error:', error);
            alert('Failed to connect to MQTT broker. Please check your settings.');
        }
    }

    disconnect() {
        if (this.client) {
            this.client.end();
            this.client = null;
        }
    }

    updateConnectionStatus(connected) {
        const statusElement = document.getElementById('connectionStatus');
        const indicator = statusElement.querySelector('.status-indicator');
        const text = statusElement.querySelector('.status-text');

        if (connected) {
            indicator.classList.remove('disconnected');
            indicator.classList.add('connected');
            text.textContent = 'Connected';
        } else {
            indicator.classList.remove('connected');
            indicator.classList.add('disconnected');
            text.textContent = 'Disconnected';
        }
    }

    subscribeToTopics() {
        if (!this.client) return;

        this.widgets.forEach(widget => {
            if (widget.topic) {
                this.client.subscribe(widget.topic, (err) => {
                    if (err) {
                        console.error('Subscription error:', err);
                    } else {
                        console.log('Subscribed to:', widget.topic);
                    }
                });
            }
        });
    }

    handleMessage(topic, message) {
        this.widgets.forEach(widget => {
            if (widget.topic === topic) {
                this.updateWidgetValue(widget.id, message);
            }
        });
    }

    publish(topic, message) {
        if (this.client && this.client.connected) {
            this.client.publish(topic, message);
        }
    }

    // Widget Management
    addWidget(widget) {
        widget.id = Date.now().toString();
        widget.value = null;
        widget.lastUpdate = null;
        this.widgets.push(widget);
        this.saveWidgets();
        this.renderDashboard();

        // Subscribe to topic if connected
        if (this.client && this.client.connected && widget.topic) {
            this.client.subscribe(widget.topic);
        }
    }

    updateWidget(id, updates) {
        const widget = this.widgets.find(w => w.id === id);
        if (widget) {
            // Unsubscribe from old topic if it changed
            if (this.client && this.client.connected && updates.topic && widget.topic !== updates.topic) {
                this.client.unsubscribe(widget.topic);
                this.client.subscribe(updates.topic);
            }

            Object.assign(widget, updates);
            this.saveWidgets();
            this.renderDashboard();
        }
    }

    deleteWidget(id) {
        const widget = this.widgets.find(w => w.id === id);
        if (widget && this.client && this.client.connected) {
            this.client.unsubscribe(widget.topic);
        }
        
        this.widgets = this.widgets.filter(w => w.id !== id);
        this.saveWidgets();
        this.renderDashboard();
    }

    updateWidgetValue(id, value) {
        const widget = this.widgets.find(w => w.id === id);
        if (widget) {
            widget.value = value;
            widget.lastUpdate = Date.now();
            this.renderWidget(widget);
        }
    }

    // Rendering
    renderDashboard() {
        const dashboard = document.getElementById('dashboard');
        
        if (this.widgets.length === 0) {
            dashboard.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-cube"></i>
                    <h2>No Widgets Yet</h2>
                    <p>Click "Add Widget" to create your first IoT dashboard widget</p>
                </div>
            `;
            return;
        }

        dashboard.innerHTML = '';
        this.widgets.forEach(widget => {
            const widgetElement = this.createWidgetElement(widget);
            dashboard.appendChild(widgetElement);
        });
    }

    createWidgetElement(widget) {
        const div = document.createElement('div');
        div.className = 'widget-card';
        div.id = `widget-${widget.id}`;
        div.draggable = true;
        
        div.innerHTML = `
            <div class="widget-header">
                <div class="widget-title">
                    <i class="fas ${widget.icon} widget-icon" style="color: ${widget.color}"></i>
                    <span>${widget.title}</span>
                </div>
                <div class="widget-actions">
                    <button class="widget-action-btn" onclick="mqttPanel.editWidget('${widget.id}')">
                        <i class="fas fa-cog"></i>
                    </button>
                </div>
            </div>
            <div class="widget-body" id="widget-body-${widget.id}">
                ${this.renderWidgetBody(widget)}
            </div>
            <div class="widget-topic">${widget.topic || 'No topic set'}</div>
        `;

        // Drag and drop
        div.addEventListener('dragstart', (e) => {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', div.innerHTML);
            div.classList.add('dragging');
            this.draggedElement = div;
        });

        div.addEventListener('dragend', () => {
            div.classList.remove('dragging');
        });

        div.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        });

        div.addEventListener('drop', (e) => {
            e.preventDefault();
            if (this.draggedElement !== div) {
                const allWidgets = Array.from(document.querySelectorAll('.widget-card'));
                const draggedIndex = allWidgets.indexOf(this.draggedElement);
                const targetIndex = allWidgets.indexOf(div);
                
                // Reorder widgets array
                const draggedWidget = this.widgets[draggedIndex];
                this.widgets.splice(draggedIndex, 1);
                this.widgets.splice(targetIndex, 0, draggedWidget);
                
                this.saveWidgets();
                this.renderDashboard();
            }
        });

        return div;
    }

    renderWidgetBody(widget) {
        switch (widget.type) {
            case 'gauge':
                return this.renderGauge(widget);
            case 'led':
                return this.renderLED(widget);
            case 'value':
                return this.renderValue(widget);
            case 'switch':
                return this.renderSwitch(widget);
            case 'chart':
                return this.renderChart(widget);
            default:
                return '<p>Unknown widget type</p>';
        }
    }

    renderWidget(widget) {
        const bodyElement = document.getElementById(`widget-body-${widget.id}`);
        if (bodyElement) {
            bodyElement.innerHTML = this.renderWidgetBody(widget);
        }
    }

    renderGauge(widget) {
        const value = parseFloat(widget.value) || 0;
        const min = widget.config?.min || 0;
        const max = widget.config?.max || 100;
        const unit = widget.config?.unit || '';
        
        const percentage = Math.min(Math.max((value - min) / (max - min), 0), 1);
        const circumference = 2 * Math.PI * 90;
        const offset = circumference * (1 - percentage);

        return `
            <div class="gauge-container">
                <svg class="gauge-svg" width="200" height="200" viewBox="0 0 200 200">
                    <circle class="gauge-circle-bg" cx="100" cy="100" r="90"></circle>
                    <circle class="gauge-circle" cx="100" cy="100" r="90"
                            style="stroke: ${widget.color}; stroke-dasharray: ${circumference}; stroke-dashoffset: ${offset};">
                    </circle>
                </svg>
                <div class="gauge-value">
                    <span class="gauge-number">${value.toFixed(1)}</span>
                    <span class="gauge-unit">${unit}</span>
                </div>
            </div>
        `;
    }

    renderLED(widget) {
        const isOn = this.evaluateLEDState(widget.value, widget.config);
        const color = isOn ? widget.color : 'transparent';
        
        return `
            <div class="led-container">
                <div class="led-indicator ${isOn ? 'led-on' : 'led-off'}" 
                     style="background-color: ${color}; color: ${widget.color};">
                </div>
                <div class="led-status" style="color: ${widget.color}">
                    ${isOn ? 'ON' : 'OFF'}
                </div>
            </div>
        `;
    }

    evaluateLEDState(value, config) {
        if (value === null || value === undefined) return false;
        
        const onValue = config?.onValue || '1';
        return value.toString().toLowerCase() === onValue.toLowerCase() ||
               value.toString().toLowerCase() === 'true' ||
               value.toString().toLowerCase() === 'on';
    }

    renderValue(widget) {
        const value = widget.value !== null ? widget.value : '--';
        const unit = widget.config?.unit || '';
        
        return `
            <div class="value-container">
                <div class="value-display" style="color: ${widget.color}">
                    ${value}
                </div>
                ${unit ? `<div class="value-unit">${unit}</div>` : ''}
            </div>
        `;
    }

    renderSwitch(widget) {
        const isOn = this.evaluateLEDState(widget.value, widget.config);
        const publishTopic = widget.config?.publishTopic || widget.topic;
        
        return `
            <div class="switch-container">
                <div class="switch-toggle ${isOn ? 'active' : ''}" 
                     style="color: ${widget.color}"
                     onclick="mqttPanel.toggleSwitch('${widget.id}', '${publishTopic}', ${!isOn})">
                    <div class="switch-slider"></div>
                </div>
                <div class="switch-label" style="color: ${widget.color}">
                    ${isOn ? 'ON' : 'OFF'}
                </div>
            </div>
        `;
    }

    renderChart(widget) {
        if (!widget.chartData) {
            widget.chartData = [];
        }

        // Add new data point
        if (widget.value !== null) {
            const maxPoints = widget.config?.maxPoints || 20;
            widget.chartData.push(parseFloat(widget.value) || 0);
            if (widget.chartData.length > maxPoints) {
                widget.chartData.shift();
            }
        }

        const data = widget.chartData;
        if (data.length === 0) {
            return '<p style="color: var(--text-secondary);">Waiting for data...</p>';
        }

        const width = 300;
        const height = 200;
        const padding = 20;
        const chartWidth = width - 2 * padding;
        const chartHeight = height - 2 * padding;

        const min = Math.min(...data);
        const max = Math.max(...data);
        const range = max - min || 1;

        const points = data.map((value, index) => {
            const x = padding + (index / (data.length - 1 || 1)) * chartWidth;
            const y = height - padding - ((value - min) / range) * chartHeight;
            return `${x},${y}`;
        }).join(' ');

        const areaPoints = `${padding},${height - padding} ${points} ${width - padding},${height - padding}`;

        return `
            <div class="chart-container">
                <svg class="chart-svg" viewBox="0 0 ${width} ${height}">
                    <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${height - padding}" class="chart-axis"/>
                    <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" class="chart-axis"/>
                    <polygon points="${areaPoints}" class="chart-area" style="fill: ${widget.color}"/>
                    <polyline points="${points}" class="chart-line" style="stroke: ${widget.color}"/>
                </svg>
            </div>
        `;
    }

    toggleSwitch(widgetId, topic, state) {
        const widget = this.widgets.find(w => w.id === widgetId);
        if (!widget) return;

        const onValue = widget.config?.onValue || '1';
        const offValue = widget.config?.offValue || '0';
        const message = state ? onValue : offValue;

        this.publish(topic, message);
        
        // Optimistically update UI
        widget.value = message;
        this.renderWidget(widget);
    }

    // Modal Management
    openModal(modalId) {
        document.getElementById(modalId).classList.add('active');
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
    }

    openConfigModal(type, widgetId = null) {
        this.currentWidgetType = type;
        this.currentWidgetId = widgetId;

        const widget = widgetId ? this.widgets.find(w => w.id === widgetId) : null;

        // Populate basic fields
        document.getElementById('widgetTitle').value = widget?.title || '';
        document.getElementById('widgetTopic').value = widget?.topic || '';
        document.getElementById('widgetIcon').value = widget?.icon || this.getDefaultIcon(type);
        document.getElementById('widgetColor').value = widget?.color || '#3498db';

        // Populate type-specific config
        const configContainer = document.getElementById('widgetSpecificConfig');
        configContainer.innerHTML = this.getWidgetConfigHTML(type, widget?.config);

        // Show/hide delete button
        document.getElementById('deleteWidgetBtn').style.display = widgetId ? 'inline-flex' : 'none';

        this.openModal('configWidgetModal');
    }

    getDefaultIcon(type) {
        const icons = {
            gauge: 'fa-tachometer-alt',
            led: 'fa-lightbulb',
            value: 'fa-hashtag',
            switch: 'fa-toggle-on',
            chart: 'fa-chart-line'
        };
        return icons[type] || 'fa-cube';
    }

    getWidgetConfigHTML(type, config) {
        switch (type) {
            case 'gauge':
                return `
                    <div class="form-row">
                        <div class="form-group">
                            <label for="gaugeMin">Minimum Value</label>
                            <input type="number" id="gaugeMin" value="${config?.min || 0}">
                        </div>
                        <div class="form-group">
                            <label for="gaugeMax">Maximum Value</label>
                            <input type="number" id="gaugeMax" value="${config?.max || 100}">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="gaugeUnit">Unit</label>
                        <input type="text" id="gaugeUnit" placeholder="°C, %, etc." value="${config?.unit || ''}">
                    </div>
                `;
            case 'led':
                return `
                    <div class="form-group">
                        <label for="ledOnValue">ON Value</label>
                        <input type="text" id="ledOnValue" placeholder="1, true, on" value="${config?.onValue || '1'}">
                        <small>Value that represents ON state</small>
                    </div>
                `;
            case 'value':
                return `
                    <div class="form-group">
                        <label for="valueUnit">Unit</label>
                        <input type="text" id="valueUnit" placeholder="°C, %, etc." value="${config?.unit || ''}">
                    </div>
                `;
            case 'switch':
                return `
                    <div class="form-group">
                        <label for="switchPublishTopic">Publish Topic (optional)</label>
                        <input type="text" id="switchPublishTopic" placeholder="Leave empty to use main topic" value="${config?.publishTopic || ''}">
                        <small>Topic to publish switch state to</small>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="switchOnValue">ON Value</label>
                            <input type="text" id="switchOnValue" value="${config?.onValue || '1'}">
                        </div>
                        <div class="form-group">
                            <label for="switchOffValue">OFF Value</label>
                            <input type="text" id="switchOffValue" value="${config?.offValue || '0'}">
                        </div>
                    </div>
                `;
            case 'chart':
                return `
                    <div class="form-group">
                        <label for="chartMaxPoints">Maximum Data Points</label>
                        <input type="number" id="chartMaxPoints" min="5" max="100" value="${config?.maxPoints || 20}">
                        <small>Number of data points to display</small>
                    </div>
                `;
            default:
                return '';
        }
    }

    saveWidget() {
        const title = document.getElementById('widgetTitle').value;
        const topic = document.getElementById('widgetTopic').value;
        const icon = document.getElementById('widgetIcon').value;
        const color = document.getElementById('widgetColor').value;

        if (!title || !topic) {
            alert('Please fill in all required fields');
            return;
        }

        const config = this.getWidgetConfigFromForm(this.currentWidgetType);

        const widgetData = {
            type: this.currentWidgetType,
            title,
            topic,
            icon,
            color,
            config
        };

        if (this.currentWidgetId) {
            this.updateWidget(this.currentWidgetId, widgetData);
        } else {
            this.addWidget(widgetData);
        }

        this.closeModal('configWidgetModal');
    }

    getWidgetConfigFromForm(type) {
        const config = {};
        
        switch (type) {
            case 'gauge':
                config.min = parseFloat(document.getElementById('gaugeMin').value) || 0;
                config.max = parseFloat(document.getElementById('gaugeMax').value) || 100;
                config.unit = document.getElementById('gaugeUnit').value;
                break;
            case 'led':
                config.onValue = document.getElementById('ledOnValue').value || '1';
                break;
            case 'value':
                config.unit = document.getElementById('valueUnit').value;
                break;
            case 'switch':
                config.publishTopic = document.getElementById('switchPublishTopic').value;
                config.onValue = document.getElementById('switchOnValue').value || '1';
                config.offValue = document.getElementById('switchOffValue').value || '0';
                break;
            case 'chart':
                config.maxPoints = parseInt(document.getElementById('chartMaxPoints').value) || 20;
                break;
        }
        
        return config;
    }

    editWidget(id) {
        const widget = this.widgets.find(w => w.id === id);
        if (widget) {
            this.openConfigModal(widget.type, id);
        }
    }

    // Settings Management
    populateSettingsForm() {
        document.getElementById('brokerUrl').value = this.connectionSettings.brokerUrl || '';
        document.getElementById('clientId').value = this.connectionSettings.clientId || '';
        document.getElementById('username').value = this.connectionSettings.username || '';
        document.getElementById('password').value = this.connectionSettings.password || '';
        document.getElementById('cleanSession').checked = this.connectionSettings.cleanSession !== false;
    }

    saveSettings() {
        this.connectionSettings = {
            brokerUrl: document.getElementById('brokerUrl').value,
            clientId: document.getElementById('clientId').value,
            username: document.getElementById('username').value,
            password: document.getElementById('password').value,
            cleanSession: document.getElementById('cleanSession').checked
        };
        localStorage.setItem('mqttSettings', JSON.stringify(this.connectionSettings));
    }

    loadSettings() {
        const saved = localStorage.getItem('mqttSettings');
        return saved ? JSON.parse(saved) : {};
    }

    // Widget Storage
    saveWidgets() {
        const widgetsToSave = this.widgets.map(w => ({
            id: w.id,
            type: w.type,
            title: w.title,
            topic: w.topic,
            icon: w.icon,
            color: w.color,
            config: w.config
        }));
        localStorage.setItem('mqttWidgets', JSON.stringify(widgetsToSave));
    }

    loadWidgets() {
        const saved = localStorage.getItem('mqttWidgets');
        if (saved) {
            this.widgets = JSON.parse(saved).map(w => ({
                ...w,
                value: null,
                lastUpdate: null,
                chartData: []
            }));
        }
    }
}

// Initialize the application
const mqttPanel = new MQTTPanel();

// Auto-connect if settings exist
if (mqttPanel.connectionSettings.brokerUrl) {
    mqttPanel.connect();
}
