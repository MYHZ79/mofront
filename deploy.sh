#!/bin/bash

# === Config ===
TARGET_DIR="/var/www/html/motiv"   # Where to deploy the built files
USER="www-data"                         # Web server user
GROUP="www-data"                        # Web server group

# === Build the Vite project ===
echo "🔧 Building the Vite project..."
npm run build || { echo "❌ Build failed"; exit 1; }

# === Clean and prepare target directory ===
echo "🧹 Cleaning target directory: $TARGET_DIR"
sudo rm -rf "$TARGET_DIR"
sudo mkdir -p "$TARGET_DIR"

# === Copy built files ===
echo "📦 Copying dist/ to $TARGET_DIR"
sudo cp -r dist/* "$TARGET_DIR"

# === Set permissions ===
echo "🔐 Setting permissions..."
sudo chown -R $USER:$GROUP "$TARGET_DIR"
sudo chmod -R 755 "$TARGET_DIR"

echo "✅ Deployment completed successfully!"
