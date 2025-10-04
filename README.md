# IoT MQTT Panel

A flexible, modern web-based IoT MQTT monitoring dashboard with fluid animations, extensive customization options, and real-time data visualization.

## Features

### 🎨 **Modern Design**
- Beautiful gradient backgrounds and glassmorphism effects
- Fluid animations and smooth transitions
- Responsive design that works on all devices
- Dark/light theme support

### 📊 **Multiple Panel Types**
- **Gauge**: Circular progress indicators with customizable ranges
- **LED Indicator**: On/off status lights with pulsing animations
- **Line Chart**: Real-time data visualization with Chart.js
- **Number Display**: Large, clear numeric values
- **Text Display**: Raw text data display
- **Switch**: Interactive toggle controls
- **Slider**: Range input controls

### 🎯 **Flexible Configuration**
- Customizable icons (Font Awesome)
- 7 color themes (Blue, Green, Red, Orange, Purple, Teal, Pink)
- Multiple panel sizes (Small, Medium, Large)
- Configurable min/max values and units
- Drag-and-drop panel reordering

### 🔌 **MQTT Integration**
- WebSocket-based MQTT connection
- Support for authentication (username/password)
- Automatic topic subscription
- Real-time data updates
- Connection status indicator

### 💾 **Data Persistence**
- Local storage for panel configurations
- Automatic panel restoration on page reload
- Settings persistence

## Quick Start

### Prerequisites
- A web server (or use a simple HTTP server)
- An MQTT broker (e.g., Mosquitto, HiveMQ, AWS IoT)

### Local Development

1. **Clone or download the project files**
   ```bash
   git clone <repository-url>
   cd iot-mqtt-panel
   ```

2. **Start a local web server**
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js (if you have http-server installed)
   npx http-server
   
   # Using PHP
   php -S localhost:8000
   ```

3. **Open your browser**
   Navigate to `http://localhost:8000`

4. **Configure MQTT connection**
   - Click the "Settings" button
   - Enter your MQTT broker details
   - Click "Connect"

5. **Add your first panel**
   - Click "Add Panel"
   - Configure your panel settings
   - Click "Create Panel"

## 🌐 Netlify Deployment

### Option 1: Deploy from GitHub (Recommended)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Add Netlify deployment configuration"
   git push origin main
   ```

2. **Connect to Netlify**
   - Go to [netlify.com](https://netlify.com) and sign up/login
   - Click "New site from Git"
   - Choose "GitHub" and authorize Netlify
   - Select your repository: `bardirune20ITU/IOT-MQTT-PANEL3`

3. **Configure Build Settings**
   - **Build command**: Leave empty (static site)
   - **Publish directory**: `/` (root directory)
   - **Branch to deploy**: `main`

4. **Deploy**
   - Click "Deploy site"
   - Netlify will automatically build and deploy your site
   - You'll get a URL like `https://your-site-name.netlify.app`

### Option 2: Manual Deploy

1. **Build your site locally**
   ```bash
   # No build step needed - it's a static site
   # Just ensure all files are ready
   ```

2. **Deploy to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Drag and drop your project folder to the deploy area
   - Or use Netlify CLI:
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod --dir .
   ```

### Netlify Configuration

The project includes optimized Netlify configuration:

- **`netlify.toml`**: Main configuration file with headers and redirects
- **`_redirects`**: Ensures SPA behavior for all routes
- **Security headers**: CSP, XSS protection, and frame options
- **Performance**: Caching rules for static assets
- **MQTT support**: Allows WebSocket connections for MQTT

### Environment Variables (Optional)

For production deployments, you can set environment variables in Netlify:

1. Go to Site settings → Environment variables
2. Add variables like:
   - `MQTT_DEFAULT_HOST`: Default MQTT broker URL
   - `MQTT_DEFAULT_USERNAME`: Default username
   - `MQTT_DEFAULT_PASSWORD`: Default password

### Custom Domain

1. Go to Site settings → Domain management
2. Add your custom domain
3. Configure DNS settings as instructed by Netlify
4. Enable HTTPS (automatic with Netlify)

### Continuous Deployment

Once connected to GitHub, Netlify will automatically:
- Deploy when you push to the main branch
- Show deployment status in pull requests
- Provide preview deployments for branches

## Configuration

### MQTT Settings
- **Host**: MQTT broker URL (e.g., `mqtt://localhost:1883`, `wss://broker.hivemq.com:8000/mqtt`)
- **Username/Password**: Authentication credentials (optional)
- **Client ID**: Unique identifier for this client

### Panel Configuration
- **Title**: Display name for the panel
- **Topic**: MQTT topic to subscribe to
- **Type**: Panel visualization type
- **Icon**: Font Awesome icon to display
- **Color**: Theme color for the panel
- **Size**: Panel dimensions (Small: 1x1, Medium: 2x1, Large: 2x2)
- **Min/Max**: Value range for numeric panels
- **Unit**: Unit of measurement (e.g., °C, %, V)

## Panel Types

### Gauge Panel
Perfect for displaying sensor readings with visual progress indication.
- Circular gauge with customizable range
- Smooth animations
- Color-coded based on theme

### LED Indicator
Ideal for binary status indicators (on/off, connected/disconnected).
- Pulsing animation when active
- Clear on/off states
- Customizable colors

### Line Chart
Real-time data visualization for trending analysis.
- Smooth line animations
- Configurable Y-axis range
- Automatic data point management (keeps last 20 points)

### Number Display
Clean, large numeric display for precise readings.
- Large, easy-to-read numbers
- Unit display
- Smooth value transitions

### Text Display
Raw text data display for non-numeric information.
- Word wrapping
- Real-time updates
- Clean typography

### Switch Control
Interactive toggle for controlling IoT devices.
- Publishes to MQTT when toggled
- Visual feedback
- State synchronization

### Slider Control
Range input for setting values on IoT devices.
- Publishes to MQTT when changed
- Visual value display
- Configurable range

## MQTT Topics

The panel subscribes to the topics you configure and publishes to them when using interactive controls (switches, sliders).

### Example Topics
- `sensor/temperature` - Temperature readings
- `sensor/humidity` - Humidity readings
- `device/status` - Device status (on/off)
- `actuator/brightness` - Brightness control (0-100)

### Message Formats
- **Numeric values**: `25.5`, `100`, `0`
- **Boolean values**: `true`, `false`, `1`, `0`
- **Text values**: Any string

## Customization

### Adding New Panel Types
1. Add the new type to the `panelType` select in `index.html`
2. Implement the content generation in `getPanelContent()` method
3. Add update logic in `updatePanelData()` method
4. Style the new panel type in `styles.css`

### Adding New Color Themes
1. Add new color option to the `panelColor` select in `index.html`
2. Add CSS variables for the new color in `styles.css`
3. Update the `getColorValue()` method in `script.js`

### Custom Icons
The panel uses Font Awesome icons. You can add any Font Awesome icon by:
1. Adding the icon class to the `panelIcon` select
2. The icon will automatically be available in the panel configuration

## Browser Compatibility

- **Chrome**: Full support
- **Firefox**: Full support
- **Safari**: Full support
- **Edge**: Full support
- **Mobile browsers**: Responsive design works on all mobile devices

## Dependencies

- **MQTT.js**: MQTT client library
- **Chart.js**: Chart visualization library
- **Font Awesome**: Icon library

All dependencies are loaded from CDN, so no local installation is required.

## Troubleshooting

### Connection Issues
- Ensure your MQTT broker is running and accessible
- Check firewall settings for WebSocket connections
- Verify authentication credentials
- Try different MQTT broker URLs (ws:// vs wss://)

### Panel Not Updating
- Verify the MQTT topic is correct
- Check that data is being published to the topic
- Ensure the panel type matches the data format
- Check browser console for errors

### Performance Issues
- Limit the number of panels (recommended: <20)
- Use appropriate chart data point limits
- Close unused browser tabs

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review browser console for errors
3. Create an issue with detailed information about your setup

---

**Enjoy monitoring your IoT devices with this flexible and beautiful dashboard!** 🚀