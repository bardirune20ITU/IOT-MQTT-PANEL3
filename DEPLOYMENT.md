# Deployment Guide

## Deploy to Netlify

### Method 1: Netlify CLI (Recommended)

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Deploy**
   ```bash
   # Deploy to a draft URL for testing
   netlify deploy
   
   # Deploy to production
   netlify deploy --prod
   ```

### Method 2: Git Integration (Automated)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit - IoT MQTT Panel"
   git push origin main
   ```

2. **Connect to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Choose your Git provider (GitHub, GitLab, Bitbucket)
   - Select your repository
   - Build settings are automatic (detected from netlify.toml)
   - Click "Deploy site"

### Method 3: Drag and Drop

1. Go to [netlify.com/drop](https://netlify.com/drop)
2. Drag the entire project folder
3. Done! Your site is live

### Method 4: Netlify CLI One-liner

```bash
npx netlify-cli deploy --prod --dir=.
```

## Configuration

The project includes a `netlify.toml` file with:
- ✅ No build command required (static site)
- ✅ Security headers configured
- ✅ Cache headers for optimal performance
- ✅ SPA routing support

## Post-Deployment

After deployment, you'll get a URL like:
```
https://your-site-name.netlify.app
```

### Custom Domain (Optional)

1. Go to Site settings → Domain management
2. Click "Add custom domain"
3. Follow DNS configuration instructions
4. Enable HTTPS (automatic with Let's Encrypt)

## Environment Variables

If you need to set default MQTT broker settings:

1. Go to Site settings → Environment variables
2. Add variables (optional):
   - `DEFAULT_BROKER_URL`
   - `DEFAULT_CLIENT_ID`

Note: Users can still change these in the settings panel.

## Testing Your Deployment

1. Open your deployed URL
2. Click "Settings" and connect to MQTT broker
3. Add widgets and test functionality
4. Open `test-simulator.html` to send test data

## Continuous Deployment

With Git integration, every push to main branch automatically:
1. Builds your site (instant - no build needed)
2. Deploys to production
3. Invalidates CDN cache
4. Updates your live site

## Troubleshooting

**Issue**: MQTT connection fails
- **Solution**: Ensure you're using `wss://` (secure WebSocket) for HTTPS sites
- Some MQTT brokers don't work over HTTPS due to mixed content restrictions
- Use a broker that supports secure WebSockets

**Issue**: 404 errors
- **Solution**: Check that `_redirects` file exists in root directory
- Netlify.toml should have the redirects configuration

**Issue**: Files not loading
- **Solution**: All paths are relative, so this shouldn't happen
- Check browser console for errors

## Performance

Your deployed site will have:
- ⚡ Global CDN distribution
- 🔒 Automatic HTTPS
- 📦 Asset optimization
- 🚀 Instant cache invalidation
- 📊 Built-in analytics (if enabled)

## Cost

- **Free tier**: Perfect for this project
  - 100 GB bandwidth/month
  - 300 build minutes/month
  - Automatic HTTPS
  - Custom domains

## Additional Netlify Features

### Deploy Previews
Every pull request gets a unique preview URL for testing.

### Rollbacks
Instantly rollback to any previous deployment from the Netlify dashboard.

### Functions (Advanced)
If you want to add serverless functions later:
```
/netlify/functions/
```

### Forms (Advanced)
Add Netlify Forms for user feedback:
```html
<form netlify>
  <!-- your form -->
</form>
```

## Alternative Hosting Platforms

This project also works on:
- **GitHub Pages**: Add to gh-pages branch
- **Vercel**: Import from Git
- **Cloudflare Pages**: Connect repository
- **Firebase Hosting**: `firebase deploy`
- **AWS S3 + CloudFront**: Upload to S3 bucket
- **Azure Static Web Apps**: Deploy from GitHub

All these platforms support static HTML/CSS/JS sites.

## Security Considerations for Production

1. **Use Secure WebSockets**: `wss://` instead of `ws://`
2. **MQTT Authentication**: Always set username/password
3. **Broker Security**: Use a private broker or enable ACLs
4. **CORS Headers**: Ensure broker allows your domain
5. **Content Security Policy**: Consider adding CSP headers

## Monitoring

After deployment, monitor:
- Netlify Analytics (optional paid feature)
- Browser console for errors
- MQTT broker connection logs
- User feedback

---

**Your IoT MQTT Panel is now ready to deploy! 🚀**

Choose any method above and you'll be live in minutes!
