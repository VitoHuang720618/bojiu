#!/bin/bash
CURRENT_DIR=$(pwd)
echo "🔍 Generating complete Nginx server block for path: $CURRENT_DIR"
sed "s|BASE_PATH|$CURRENT_DIR|g" nginx-template.conf > bojiu.nginx.conf
echo "✨ Success! Config generated: bojiu.nginx.conf"
echo "👉 You can now symlink this file to /etc/nginx/sites-enabled/ or paste its content into your Nginx config."
