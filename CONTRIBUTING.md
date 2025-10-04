# Contributing to IoT MQTT Panel

Thank you for your interest in contributing to the IoT MQTT Panel project! 

## Development Setup

1. Clone the repository
2. Open `index.html` in your browser or use a local server
3. Make your changes
4. Test thoroughly

## Code Style

- Use consistent indentation (4 spaces)
- Comment complex logic
- Use meaningful variable names
- Follow existing code patterns

## Adding New Widget Types

To add a new widget type:

1. **Add HTML template** in `index.html`:
   ```html
   <div class="widget-type-card" data-type="yourtype">
       <i class="fas fa-icon"></i>
       <h3>Your Widget</h3>
       <p>Description</p>
   </div>
   ```

2. **Add CSS styling** in `styles.css`:
   ```css
   .your-widget-container {
       /* Your styles */
   }
   ```

3. **Implement rendering** in `app.js`:
   ```javascript
   renderYourWidget(widget) {
       // Render logic
       return html;
   }
   ```

4. **Add configuration form**:
   ```javascript
   getWidgetConfigHTML(type, config) {
       case 'yourtype':
           return `/* config HTML */`;
   }
   ```

5. **Handle updates** in the switch statement of `renderWidgetBody()`

## Testing

- Test with public MQTT brokers
- Test all widget types
- Test on mobile devices
- Test connection/disconnection scenarios
- Verify localStorage persistence

## Pull Request Process

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Update documentation
6. Submit pull request

## Ideas for Contributions

- [ ] Additional widget types (Progress Bar, Slider, Button, etc.)
- [ ] Dashboard templates
- [ ] Export/Import configuration
- [ ] Historical data storage
- [ ] Alert system
- [ ] MQTT over TLS support
- [ ] Multi-language support
- [ ] Theme customization
- [ ] Widget groups/tabs
- [ ] Advanced charting options

## Questions?

Open an issue for discussion before starting major work.
