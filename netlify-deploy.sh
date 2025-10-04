#!/bin/bash

# Netlify Deployment Script
# This script helps you deploy the IoT MQTT Panel to Netlify

echo "🚀 IoT MQTT Panel - Netlify Deployment"
echo "======================================"
echo ""

# Check if netlify-cli is installed
if ! command -v netlify &> /dev/null; then
    echo "📦 Netlify CLI not found. Installing..."
    npm install -g netlify-cli
fi

echo "🔐 Logging in to Netlify..."
netlify login

echo ""
echo "Choose deployment type:"
echo "1) Deploy to draft (testing)"
echo "2) Deploy to production"
echo ""
read -p "Enter choice (1 or 2): " choice

case $choice in
    1)
        echo "📤 Deploying to draft URL..."
        netlify deploy
        ;;
    2)
        echo "📤 Deploying to production..."
        netlify deploy --prod
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "  1. Test your deployed site"
echo "  2. Configure MQTT broker (use wss:// for HTTPS)"
echo "  3. Add your widgets"
echo "  4. Share your dashboard URL!"
