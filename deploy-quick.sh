#!/bin/bash

# Quick deployment script - One-liner version
echo "🚀 Quick deployment starting..." && \
cd frontend-next && \
git pull origin main && \
npm install && \
pm2 stop tusgal-app && \
NODE_OPTIONS="--max-old-space-size=768" npm run build && \
pm2 start npm --name "tusgal-app" -- start && \
pm2 save && \
echo "✅ Quick deployment completed!" && \
pm2 status
