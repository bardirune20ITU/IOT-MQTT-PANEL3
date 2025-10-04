# Quick Start Guide

Get your IoT MQTT Panel up and running in 5 minutes!

## Step 1: Start the Server (Choose One)

### Option A: Using Python
```bash
python -m http.server 8000
```

### Option B: Using Node.js
```bash
npm start
```

### Option C: Using any web server
Point your web server to this directory.

## Step 2: Open in Browser

Navigate to: `http://localhost:8000`

## Step 3: Connect to MQTT Broker

### Using Public Broker (Quick Test)
1. Click **Settings** button
2. Broker URL: `ws://broker.hivemq.com:8000/mqtt`
3. Click **Connect**

### Using Local Broker
1. Make sure your broker has WebSocket support
2. Click **Settings** button  
3. Broker URL: `ws://localhost:8000/mqtt` (adjust port as needed)
4. Enter credentials if required
5. Click **Connect**

## Step 4: Add Your First Widget

### Example: Temperature Gauge
1. Click **Add Widget**
2. Select **Gauge**
3. Fill in:
   - Title: `Room Temperature`
   - MQTT Topic: `home/livingroom/temperature`
   - Icon: `Thermometer`
   - Color: Red (#e74c3c)
   - Min: 0, Max: 50
   - Unit: °C
4. Click **Save**

## Step 5: Test with Simulator

1. Open `test-simulator.html` in another browser tab
2. Connect to the same broker
3. Use the sliders and buttons to publish test data
4. Watch your widgets update in real-time!

## Example Dashboard

Create these widgets for a complete home monitoring dashboard:

1. **Temperature Gauge** 
   - Topic: `home/livingroom/temperature`
   - Min: 0, Max: 50, Unit: °C

2. **Humidity Gauge**
   - Topic: `home/livingroom/humidity`
   - Min: 0, Max: 100, Unit: %

3. **Motion LED**
   - Topic: `home/livingroom/motion`
   - ON Value: 1

4. **Light Switch**
   - Topic: `home/livingroom/light`
   - Publish Topic: `home/livingroom/light/set`
   - ON: "ON", OFF: "OFF"

5. **Temperature Chart**
   - Topic: `home/livingroom/temperature`
   - Max Points: 30

## Publishing Data

### Using Mosquitto
```bash
# Temperature
mosquitto_pub -t "home/livingroom/temperature" -m "23.5"

# Humidity
mosquitto_pub -t "home/livingroom/humidity" -m "65"

# Motion
mosquitto_pub -t "home/livingroom/motion" -m "1"
```

### Using Node.js
```javascript
const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://broker.hivemq.com');

client.on('connect', () => {
    setInterval(() => {
        const temp = (20 + Math.random() * 10).toFixed(1);
        client.publish('home/livingroom/temperature', temp);
    }, 2000);
});
```

### Using Python
```python
import paho.mqtt.client as mqtt
import time
import random

client = mqtt.Client()
client.connect("broker.hivemq.com", 1883, 60)

while True:
    temp = round(20 + random.random() * 10, 1)
    client.publish("home/livingroom/temperature", temp)
    time.sleep(2)
```

## Next Steps

- Customize widget colors and icons
- Drag and drop to reorder widgets
- Edit widgets by clicking the gear icon
- Your configuration is saved automatically

## Troubleshooting

**Can't connect?**
- Verify broker URL format: `ws://` or `wss://`
- Check if broker has WebSocket support enabled
- Try the public HiveMQ broker for testing

**No data showing?**
- Verify topic names match exactly
- Check broker connection status (top center)
- Test publishing with mosquitto_pub

**Need help?**
- See full README.md
- Check example-config.json
- Open an issue on GitHub

---

**You're all set! 🎉 Start building your IoT dashboard!**
