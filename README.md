# IoT MQTT Panel

A modern, flexible web-based MQTT dashboard for monitoring and controlling IoT devices with fluid animations, clear information display, and maximum configuration flexibility.

![IoT MQTT Panel](https://img.shields.io/badge/MQTT-Dashboard-blue)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

## ✨ Features

- **🎨 Multiple Widget Types**
  - **Gauge**: Display numeric values with circular gauges
  - **LED Indicator**: Show on/off status with animated LEDs
  - **Value Display**: Show raw numeric or text values
  - **Switch**: Control devices with interactive switches
  - **Line Chart**: Visualize data trends over time

- **⚡ Fluid Animations**
  - Smooth transitions and animations
  - Pulsing indicators and glowing effects
  - Responsive hover effects
  - Real-time data updates

- **🎯 Maximum Flexibility**
  - Customizable icons (15+ options)
  - Custom color selection for each widget
  - Configurable value ranges and units
  - Custom MQTT topics per widget
  - Drag-and-drop widget reordering

- **💾 Persistence**
  - Local storage for dashboard configuration
  - Connection settings saved automatically
  - Widget configurations persist across sessions

- **📱 Responsive Design**
  - Works on desktop, tablet, and mobile
  - Modern, dark-themed UI
  - Intuitive user interface

## 🚀 Quick Start

### Prerequisites

- A web browser (Chrome, Firefox, Safari, Edge)
- An MQTT broker (e.g., Mosquitto, HiveMQ, EMQX)

### Option 1: Deploy to Netlify (Recommended for Production)

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy)

**Quick Deploy**:
```bash
# Using Netlify CLI
npm install -g netlify-cli
netlify deploy --prod
```

**Or use Git Integration**:
1. Push this repository to GitHub
2. Connect to Netlify
3. Deploy automatically

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

### Option 2: Local Development

1. **Clone or download this repository**
   ```bash
   git clone <repository-url>
   cd iot-mqtt-panel
   ```

2. **Serve the files**
   
   Option A: Using Python 3:
   ```bash
   python -m http.server 8000
   ```

   Option B: Using Node.js http-server:
   ```bash
   npx http-server -p 8000
   ```

   Option C: Using any other web server (Apache, Nginx, etc.)

3. **Open in browser**
   ```
   http://localhost:8000
   ```

## 📖 Usage Guide

### 1. Configure MQTT Connection

1. Click the **Settings** button in the header
2. Enter your MQTT broker details:
   - **Broker URL**: WebSocket URL (e.g., `ws://broker.hivemq.com:8000/mqtt`)
   - **Client ID**: Unique identifier (auto-generated)
   - **Username/Password**: Optional authentication
   - **Clean Session**: Enable/disable clean session
3. Click **Connect**

**Example Public Brokers**:

For local development (HTTP):
- `ws://broker.hivemq.com:8000/mqtt`
- `ws://test.mosquitto.org:8080`

For production/HTTPS deployments (like Netlify):
- `wss://broker.hivemq.com:8884/mqtt` (secure WebSocket)
- Use a broker that supports WSS (secure WebSocket)

**Important**: HTTPS sites require WSS (secure WebSocket) connections. HTTP sites can use WS.

### 2. Add Widgets

1. Click the **Add Widget** button
2. Select a widget type:
   - **Gauge**: For numeric values with min/max ranges
   - **LED Indicator**: For binary on/off status
   - **Value Display**: For displaying any value
   - **Switch**: For controlling devices
   - **Line Chart**: For time-series data

3. Configure the widget:
   - **Title**: Display name for the widget
   - **MQTT Topic**: Topic to subscribe/publish to
   - **Icon**: Choose from 15+ icons
   - **Color**: Pick a custom color
   - **Type-specific settings**: See below

4. Click **Save**

### 3. Widget Configuration Details

#### Gauge Widget
- **Minimum Value**: Lower bound of the gauge
- **Maximum Value**: Upper bound of the gauge
- **Unit**: Display unit (e.g., °C, %, V)
- Displays numeric values with a circular progress indicator

#### LED Indicator Widget
- **ON Value**: Value that represents ON state (default: "1")
- Accepts: "1", "true", "on" (case-insensitive)
- Shows animated glowing effect when ON

#### Value Display Widget
- **Unit**: Optional unit to display
- Shows raw value from MQTT topic
- Supports text and numeric values

#### Switch Widget
- **Publish Topic**: Optional separate topic for publishing
- **ON Value**: Value to send when switched ON (default: "1")
- **OFF Value**: Value to send when switched OFF (default: "0")
- Interactive toggle control

#### Line Chart Widget
- **Maximum Data Points**: Number of points to display (5-100)
- Automatically scrolls as new data arrives
- Shows trend with area fill and line

### 4. Manage Widgets

- **Edit**: Click the gear icon on any widget
- **Delete**: Click Delete in the configuration modal
- **Reorder**: Drag and drop widgets to rearrange

## 🔧 MQTT Setup Examples

### Using Mosquitto (Local)

1. **Install Mosquitto**
   ```bash
   # Ubuntu/Debian
   sudo apt-get install mosquitto mosquitto-clients
   
   # macOS
   brew install mosquitto
   ```

2. **Configure WebSocket Support**
   
   Edit `/etc/mosquitto/mosquitto.conf`:
   ```
   listener 1883
   protocol mqtt
   
   listener 8000
   protocol websockets
   ```

3. **Start Mosquitto**
   ```bash
   mosquitto -c /etc/mosquitto/mosquitto.conf
   ```

4. **Test Publishing**
   ```bash
   mosquitto_pub -t "test/temperature" -m "23.5"
   ```

### Using Docker

```bash
docker run -d -p 1883:1883 -p 8000:8000 \
  -v $(pwd)/mosquitto.conf:/mosquitto/config/mosquitto.conf \
  eclipse-mosquitto
```

## 📡 Example IoT Scenarios

### Temperature Monitoring

1. Create a **Gauge Widget**
   - Topic: `home/livingroom/temperature`
   - Min: 0, Max: 50
   - Unit: °C
   - Icon: Thermometer
   - Color: #e74c3c

2. Create a **Line Chart Widget**
   - Topic: `home/livingroom/temperature`
   - Max Points: 30

### Light Control

1. Create a **Switch Widget**
   - Topic: `home/bedroom/light`
   - ON Value: "1"
   - OFF Value: "0"
   - Icon: Light Bulb
   - Color: #f39c12

2. Create an **LED Indicator Widget**
   - Topic: `home/bedroom/light`
   - ON Value: "1"
   - Icon: Light Bulb
   - Color: #f39c12

### Multi-Sensor Dashboard

Create multiple widgets for:
- Temperature (Gauge + Chart)
- Humidity (Gauge + Chart)
- Motion Sensor (LED Indicator)
- Door Status (LED Indicator)
- Fan Control (Switch)
- Light Control (Switch)

## 🎨 Customization

### Colors

Each widget can have a custom color. Popular choices:
- **Blue** (#3498db): Temperature, water
- **Green** (#2ecc71): Success, on state
- **Red** (#e74c3c): Alerts, high values
- **Orange** (#f39c12): Warnings, lights
- **Purple** (#9b59b6): Humidity
- **Cyan** (#1abc9c): Air quality

### Icons

Available icons include:
- Thermometer, Temperature, Droplet
- Light Bulb, Sun, Cloud
- Wind, Fan, Fire, Snowflake
- Bolt, Plug, Power, Gauge
- Heart, and more...

## 🔐 Security Considerations

1. **Use WSS**: For production, use `wss://` instead of `ws://`
2. **Authentication**: Always set username/password for your broker
3. **Access Control**: Use MQTT ACLs to restrict topics
4. **CORS**: Configure your broker for proper CORS headers
5. **Local Network**: Keep broker on local network when possible

## 🛠️ Technology Stack

- **HTML5**: Structure and markup
- **CSS3**: Styling, animations, responsive design
- **Vanilla JavaScript**: Application logic
- **MQTT.js**: MQTT client library
- **Font Awesome**: Icons
- **Local Storage**: Data persistence

## 🔄 Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Opera 76+

## 📝 Tips & Tricks

1. **Test with Public Broker**: Use HiveMQ's public broker for testing
2. **Topic Naming**: Use hierarchical topics like `home/room/sensor`
3. **Widget Organization**: Group related widgets together
4. **Color Coding**: Use consistent colors for similar sensors
5. **Responsive Grid**: Widgets auto-arrange based on screen size
6. **Backup Config**: Export localStorage to backup your dashboard

## 🐛 Troubleshooting

### Cannot Connect to Broker
- Verify broker URL is correct (must use `ws://` or `wss://`)
- Check if broker has WebSocket support enabled
- Ensure broker is accessible from your network
- Check browser console for error messages

### Widgets Not Updating
- Verify MQTT topics match your device's publish topics
- Check connection status in header
- Ensure client is subscribed to topics
- Test topics using mosquitto_pub/mosquitto_sub

### Performance Issues
- Reduce chart data points
- Limit number of widgets
- Use appropriate update intervals on devices
- Clear old data periodically

## 🤝 Contributing

Contributions are welcome! Areas for improvement:
- Additional widget types
- More configuration options
- Export/import dashboard configs
- Historical data storage
- Alert/notification system

## 📄 License

This project is open source and available under the MIT License.

## 🌟 Acknowledgments

Inspired by [mqtt-panel](https://github.com/sourcesimian/mqtt-panel) with modern web technologies and enhanced features.

## 📧 Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

**Enjoy building your IoT dashboard! 🚀**
